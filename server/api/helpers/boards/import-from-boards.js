const fs = require('fs');
const path = require('path');

const parseJSON = (json) => {
  try {
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

module.exports = {
  inputs: {
    currentUser: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    importTempDir: {
      type: 'string',
      required: true,
    },
    importFilePath: {
      type: 'string',
      required: true,
    },
    importNonExistingUsers: {
      type: 'boolean',
    },
    importProjectManagers: {
      type: 'boolean',
    },
    importGettingStartedProject: {
      type: 'boolean',
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const { currentUser } = inputs;

    const { projectManagers, boardMemberships, lists, cards, cardMemberships, actions, attachments, cardLabels, cardSubscriptions, labels, tasks, taskMemberships, users } = await sails.helpers.utils.loadCsvs(
      inputs.importTempDir,
      ['projectManagers', 'boardMemberships', 'lists', 'cards', 'cardMemberships', 'actions', 'attachments', 'cardLabels', 'cardSubscriptions', 'labels', 'tasks', 'taskMemberships', 'users'],
    );

    if (inputs.importGettingStartedProject) {
      boardMemberships.forEach((boardMembership) => {
        boardMembership.userId = currentUser.id; // eslint-disable-line no-param-reassign
      });
      cardMemberships.forEach((cardMembership) => {
        cardMembership.userId = currentUser.id; // eslint-disable-line no-param-reassign
      });
      actions.forEach((action) => {
        action.userId = currentUser.id; // eslint-disable-line no-param-reassign
      });
      cardSubscriptions.forEach((cardSubscription) => {
        cardSubscription.userId = currentUser.id; // eslint-disable-line no-param-reassign
      });
      taskMemberships.forEach((taskMembership) => {
        taskMembership.userId = currentUser.id; // eslint-disable-line no-param-reassign
      });
      users.forEach((user) => {
        user.id = currentUser.id; // eslint-disable-line no-param-reassign
      });
    }

    const importedLists = {};
    const importedLabels = {};
    const importedAttachments = {};
    const allUsers = {};

    const getCardsOfList = (listId) => cards.filter((card) => card.listId === listId);
    const getAttachmentsOfCard = (cardId) => attachments.filter((attachment) => attachment.cardId === cardId);
    const getCardMembershipsOfCard = (cardId) => cardMemberships.filter((cardMembership) => cardMembership.cardId === cardId);
    const getCardSubscriptionsOfCard = (cardId) => cardSubscriptions.filter((cardSubscription) => cardSubscription.cardId === cardId);
    const getCardLabelsOfCard = (cardId) => cardLabels.filter((cardLabel) => cardLabel.cardId === cardId);
    const getTasksOfCard = (cardId) => tasks.filter((task) => task.cardId === cardId);
    const getTaskMembershipsOfTask = (taskId) => taskMemberships.filter((taskMembership) => taskMembership.taskId === taskId);
    const getActionsOfCard = (cardId) => actions.filter((action) => action.cardId === cardId);

    const getLabelColor = (labelColor) => Label.COLORS.find((color) => color.indexOf(labelColor) !== -1) || 'desert-sand';

    const importUsers = async () => {
      return Promise.all(
        users.map(async (user) => {
          // TODO matching by id should be used only for the same instance - add instance identifier to the export data
          const existingUserById = await sails.helpers.users.getOne(user.id);
          if (existingUserById) {
            allUsers[user.id] = existingUserById;
            return;
          }
          const existingUserByEmail = await sails.helpers.users.getOneByEmailOrUsername(user.email);
          if (existingUserByEmail) {
            allUsers[user.id] = existingUserByEmail;
            return;
          }
          if (inputs.importNonExistingUsers) {
            let fileData;
            let avatarData;
            if (user.avatar) {
              avatarData = parseJSON(user.avatar);
              if (avatarData) {
                const dirPath = path.join(inputs.importTempDir, 'user-avatars', avatarData.dirname, `original.${avatarData.extension}`);
                const metadata = {
                  fd: dirPath,
                  filename: `original.${avatarData.extension}`,
                };
                fileData = await sails.helpers.users.processUploadedAvatarFile(metadata);
              }
            }
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              avatar: fileData && fileData.dirname ? { dirname: fileData.dirname, extension: avatarData.extension } : null,
              createdById: currentUser.id,
            })
              .intercept(
                {
                  message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
                },
                'emailAlreadyInUse',
              )
              .fetch();

            await sails.helpers.userPrefs.createOne.with({ values: { id: newUser.id }, currentUser });

            allUsers[user.id] = newUser;
          }
        }),
      );
    };

    const importProjectManagers = async () => {
      return Promise.all(
        projectManagers.map(async (projectManager) => {
          if (allUsers[projectManager.userId]) {
            const updatedAt = parseJSON(projectManager.updatedAt);
            const newProjectManager = await ProjectManager.create({
              projectId: inputs.board.projectId,
              userId: allUsers[projectManager.userId].id,
              createdAt: parseJSON(projectManager.createdAt),
              createdById: allUsers[projectManager.createdById]?.id ?? currentUser.id,
              updatedAt,
              updatedById: updatedAt && (allUsers[projectManager.updatedById]?.id ?? currentUser.id),
            })
              .tolerate('E_UNIQUE')
              .fetch();

            if (newProjectManager) {
              const projectRelatedUserIds = await sails.helpers.projects.getManagerAndBoardMemberUserIds(inputs.board.projectId);

              projectRelatedUserIds.forEach((userId) => {
                sails.sockets.broadcast(
                  `user:${userId}`,
                  'projectManagerCreate',
                  {
                    item: newProjectManager,
                  },
                  inputs.request,
                );
              });
            }
          }
        }),
      );
    };

    const importBoardMemberships = async () => {
      return Promise.all(
        boardMemberships.map(async (boardMembership) => {
          if (allUsers[boardMembership.userId]) {
            const updatedAt = parseJSON(boardMembership.updatedAt);
            const newBoardMembership = await BoardMembership.create({
              boardId: inputs.board.id,
              userId: allUsers[boardMembership.userId].id,
              role: boardMembership.role,
              ...(boardMembership.canComment !== '' && { canComment: boardMembership.canComment }),
              createdAt: parseJSON(boardMembership.createdAt),
              createdById: allUsers[boardMembership.createdById]?.id ?? currentUser.id,
              updatedAt,
              updatedById: updatedAt && (allUsers[boardMembership.updatedById]?.id ?? currentUser.id),
            })
              .tolerate('E_UNIQUE')
              .fetch();

            if (newBoardMembership.userId !== currentUser.id) {
              sails.sockets.broadcast(
                `user:${newBoardMembership.userId}`,
                'boardMembershipCreate',
                {
                  item: newBoardMembership,
                },
                inputs.request,
              );
            }
          }
        }),
      );
    };

    const importLabels = async () => {
      return Promise.all(
        labels.map(async (label) => {
          const updatedAt = parseJSON(label.updatedAt);
          const newLabel = await Label.create({
            boardId: inputs.board.id,
            name: label.name || null,
            color: getLabelColor(label.color),
            position: label.position,
            createdAt: parseJSON(label.createdAt),
            createdById: allUsers[label.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[label.updatedById]?.id ?? currentUser.id),
          }).fetch();

          importedLabels[label.id] = newLabel;
        }),
      );
    };

    const importAttachments = async (newCard, card) => {
      return Promise.all(
        getAttachmentsOfCard(card.id).map(async (attachment) => {
          const dirPath = path.join(inputs.importTempDir, 'attachments', attachment.dirname, attachment.filename);
          const metadata = {
            fd: dirPath,
            filename: attachment.filename,
          };
          const fileData = await sails.helpers.attachments.processUploadedFile(metadata);

          const updatedAt = parseJSON(attachment.updatedAt);
          const newAttachment = await Attachment.create({
            cardId: newCard.id,
            // TODO add original attachment author here, migration, attachmentCreate
            name: attachment.name,
            image: parseJSON(attachment.image),
            filename: attachment.filename,
            dirname: fileData.dirname,
            createdAt: parseJSON(attachment.createdAt),
            createdById: allUsers[attachment.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[attachment.updatedById]?.id ?? currentUser.id),
          }).fetch();

          importedAttachments[attachment.id] = newAttachment;
        }),
      );
    };

    const importCardMemberships = async (newCard, card) => {
      return Promise.all(
        getCardMembershipsOfCard(card.id).map(async (cardMembership) => {
          if (allUsers[cardMembership.userId]) {
            const updatedAt = parseJSON(cardMembership.updatedAt);
            await CardMembership.create({
              cardId: newCard.id,
              userId: allUsers[cardMembership.userId].id,
              createdAt: parseJSON(cardMembership.createdAt),
              createdById: allUsers[cardMembership.createdById]?.id ?? currentUser.id,
              updatedAt,
              updatedById: updatedAt && (allUsers[cardMembership.updatedById]?.id ?? currentUser.id),
            }).tolerate('E_UNIQUE');
          }
        }),
      );
    };

    const importCardSubscriptions = async (newCard, card) => {
      return Promise.all(
        getCardSubscriptionsOfCard(card.id).map(async (cardSubscription) => {
          if (allUsers[cardSubscription.userId]) {
            await CardSubscription.create({
              cardId: newCard.id,
              userId: allUsers[cardSubscription.userId].id,
              isPermanent: cardSubscription.isPermanent,
              createdAt: parseJSON(cardSubscription.createdAt),
              updatedAt: parseJSON(cardSubscription.updatedAt),
            }).tolerate('E_UNIQUE');
          }
        }),
      );
    };

    const importCardLabels = async (newCard, card) => {
      return Promise.all(
        getCardLabelsOfCard(card.id).map(async (cardLabel) => {
          if (importedLabels[cardLabel.labelId]) {
            const updatedAt = parseJSON(cardLabel.updatedAt);
            await CardLabel.create({
              cardId: newCard.id,
              labelId: importedLabels[cardLabel.labelId].id,
              createdAt: parseJSON(cardLabel.createdAt),
              createdById: allUsers[cardLabel.createdById]?.id ?? currentUser.id,
              updatedAt,
              updatedById: updatedAt && (allUsers[cardLabel.updatedById]?.id ?? currentUser.id),
            });
          }
        }),
      );
    };

    const importTaskMemberships = async (newTask, task) => {
      return Promise.all(
        getTaskMembershipsOfTask(task.id).map(async (taskMembership) => {
          if (allUsers[taskMembership.userId]) {
            const updatedAt = parseJSON(taskMembership.updatedAt);
            await TaskMembership.create({
              taskId: newTask.id,
              userId: allUsers[taskMembership.userId].id,
              createdAt: parseJSON(taskMembership.createdAt),
              createdById: allUsers[taskMembership.createdById]?.id ?? currentUser.id,
              updatedAt,
              updatedById: updatedAt && (allUsers[taskMembership.updatedById]?.id ?? currentUser.id),
            }).tolerate('E_UNIQUE');
          }
        }),
      );
    };

    const importTasks = async (newCard, card) => {
      return Promise.all(
        getTasksOfCard(card.id).map(async (task) => {
          const updatedAt = parseJSON(task.updatedAt);
          const newTask = await Task.create({
            cardId: newCard.id,
            position: task.position,
            name: task.name,
            isCompleted: task.isCompleted,
            dueDate: parseJSON(task.dueDate),
            createdAt: parseJSON(task.createdAt),
            createdById: allUsers[task.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[task.updatedById]?.id ?? currentUser.id),
          }).fetch();

          await importTaskMemberships(newTask, task);
        }),
      );
    };

    const importActions = async (newCard, card) => {
      return Promise.all(
        getActionsOfCard(card.id).map(async (action) => {
          const newData = parseJSON(action.data);
          if (newData) {
            if (newData.list) {
              newData.list.id = importedLists[newData.list.id] ? importedLists[newData.list.id].id : null;
            }
            if (newData.fromList) {
              newData.fromList.id = importedLists[newData.fromList.id] ? importedLists[newData.fromList.id].id : null;
            }
            if (newData.toList) {
              newData.toList.id = importedLists[newData.toList.id] ? importedLists[newData.toList.id].id : null;
            }
            if (newData.text && !allUsers[action.userId]) {
              newData.text = `${newData.text}\n\n---\n*Imported comment, original author: unknown*`;
            }
            // TODO add original action author here, migration, actionCreate
          }

          const updatedAt = parseJSON(action.updatedAt);
          await Action.create({
            cardId: newCard.id,
            userId: allUsers[action.userId] ? allUsers[action.userId].id : currentUser.id,
            type: action.type,
            data: newData,
            createdAt: parseJSON(action.createdAt),
            createdById: allUsers[action.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[action.updatedById]?.id ?? currentUser.id),
          });
        }),
      );
    };

    const importCards = async (newList, list) => {
      return Promise.all(
        getCardsOfList(list.id).map(async (card) => {
          const updatedAt = parseJSON(card.updatedAt);
          const newCard = await Card.create({
            boardId: inputs.board.id,
            listId: newList.id,
            // TODO add original card author here, migration, cardCreate
            position: card.position,
            name: card.name,
            description: card.description || null,
            dueDate: parseJSON(card.dueDate),
            commentCount: card.commentCount,
            timer: parseJSON(card.timer),
            createdAt: parseJSON(card.createdAt),
            createdById: allUsers[card.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[card.updatedById]?.id ?? currentUser.id),
          }).fetch();

          await importAttachments(newCard, card);
          await Card.update({ id: newCard.id }).set({ coverAttachmentId: importedAttachments[card.coverAttachmentId] ? importedAttachments[card.coverAttachmentId].id : null });
          await importCardMemberships(newCard, card);
          await importCardSubscriptions(newCard, card);
          await importCardLabels(newCard, card);
          await importTasks(newCard, card);
          await importActions(newCard, card);

          return newCard;
        }),
      );
    };

    const importLists = async () => {
      return Promise.all(
        lists.map(async (list) => {
          const updatedAt = parseJSON(list.updatedAt);
          const newList = await List.create({
            boardId: inputs.board.id,
            name: list.name,
            position: list.position,
            isCollapsed: list.isCollapsed,
            createdAt: parseJSON(list.createdAt),
            createdById: allUsers[list.createdById]?.id ?? currentUser.id,
            updatedAt,
            updatedById: updatedAt && (allUsers[list.updatedById]?.id ?? currentUser.id),
          }).fetch();

          importedLists[list.id] = newList;

          return importCards(newList, list);
        }),
      );
    };

    try {
      await importUsers();
      if (inputs.importProjectManagers) {
        await importProjectManagers();
      }
      await importBoardMemberships();
      await importLabels();
      await importLists();
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
    }

    if (!inputs.importGettingStartedProject) {
      fs.rmSync(inputs.importTempDir, { recursive: true, force: true });
      fs.rmSync(inputs.importFilePath, { force: true });
    }
  },
};
