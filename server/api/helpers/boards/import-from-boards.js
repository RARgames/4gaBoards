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
        if (action.data) {
          const data = parseJSON(action.data);
          if (data && data.userId && data.userName) {
            data.userId = currentUser.id;
            data.userName = currentUser.name;
            action.data = JSON.stringify(data); // eslint-disable-line no-param-reassign
          }
        }
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
    const importedCardLabels = {};
    const importedAttachments = {};
    const importedCardMemberships = {};
    const importedTasks = {};
    const importedTaskMemberships = {};
    const importedActions = {};
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
      const attachmentsToImport = getAttachmentsOfCard(card.id);

      const filesData = await Promise.all(
        attachmentsToImport.map((attachment) => {
          const dirPath = path.join(inputs.importTempDir, 'attachments', attachment.dirname, attachment.filename);
          return sails.helpers.attachments.processUploadedFile({
            fd: dirPath,
            filename: attachment.filename,
          });
        }),
      );

      const attachmentRecords = attachmentsToImport.map((attachment, i) => {
        const updatedAt = parseJSON(attachment.updatedAt);
        return {
          cardId: newCard.id,
          name: attachment.name,
          image: parseJSON(attachment.image),
          filename: attachment.filename,
          dirname: filesData[i].dirname,
          createdAt: parseJSON(attachment.createdAt),
          createdById: allUsers[attachment.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[attachment.updatedById]?.id ?? currentUser.id),
          // TODO add original attachment author here, migration, attachmentCreate
        };
      });

      const insertedAttachments = await Attachment.createEach(attachmentRecords).fetch();

      attachmentsToImport.forEach((attachment, i) => {
        importedAttachments[attachment.id] = insertedAttachments[i];
      });
    };

    const importCardMemberships = async (newCard, card) => {
      const cardMembershipsToImport = getCardMembershipsOfCard(card.id).filter((cardMembership) => allUsers[cardMembership.userId]);

      const cardMembershipRecords = cardMembershipsToImport.map((cardMembership) => {
        const updatedAt = parseJSON(cardMembership.updatedAt);
        return {
          cardId: newCard.id,
          userId: allUsers[cardMembership.userId].id,
          createdAt: parseJSON(cardMembership.createdAt),
          createdById: allUsers[cardMembership.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[cardMembership.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedCardMemberships = await CardMembership.createEach(cardMembershipRecords).tolerate('E_UNIQUE').fetch();

      cardMembershipsToImport.forEach((cardMembership, i) => {
        importedCardMemberships[cardMembership.id] = insertedCardMemberships[i];
      });
    };

    const importCardSubscriptions = async (newCard, card) => {
      const cardSubscriptionsToImport = getCardSubscriptionsOfCard(card.id).filter((cardSubscription) => allUsers[cardSubscription.userId]);

      const cardSubscriptionRecords = cardSubscriptionsToImport.map((cardSubscription) => ({
        cardId: newCard.id,
        userId: allUsers[cardSubscription.userId].id,
        isPermanent: cardSubscription.isPermanent,
        createdAt: parseJSON(cardSubscription.createdAt),
        updatedAt: parseJSON(cardSubscription.updatedAt),
      }));

      await CardSubscription.createEach(cardSubscriptionRecords).tolerate('E_UNIQUE');
    };

    const importCardLabels = async (newCard, card) => {
      const cardLabelsToImport = getCardLabelsOfCard(card.id).filter((cardLabel) => importedLabels[cardLabel.labelId]);

      const labelRecords = cardLabelsToImport.map((cardLabel) => {
        const updatedAt = parseJSON(cardLabel.updatedAt);
        return {
          cardId: newCard.id,
          labelId: importedLabels[cardLabel.labelId].id,
          createdAt: parseJSON(cardLabel.createdAt),
          createdById: allUsers[cardLabel.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[cardLabel.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedCardLabels = await CardLabel.createEach(labelRecords).fetch();

      cardLabelsToImport.forEach((cardLabel, i) => {
        importedCardLabels[cardLabel.id] = insertedCardLabels[i];
      });
    };

    const importTaskMemberships = async (newTask, task) => {
      const taskMembershipsToImport = getTaskMembershipsOfTask(task.id).filter((taskMembership) => allUsers[taskMembership.userId]);

      const taskMembershipRecords = taskMembershipsToImport.map((taskMembership) => {
        const updatedAt = parseJSON(taskMembership.updatedAt);
        return {
          taskId: newTask.id,
          userId: allUsers[taskMembership.userId].id,
          createdAt: parseJSON(taskMembership.createdAt),
          createdById: allUsers[taskMembership.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[taskMembership.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedTaskMemberships = await TaskMembership.createEach(taskMembershipRecords).tolerate('E_UNIQUE').fetch();

      taskMembershipsToImport.forEach((taskMembership, i) => {
        importedTaskMemberships[taskMembership.id] = insertedTaskMemberships[i];
      });
    };

    const importTasks = async (newCard, card) => {
      const tasksToImport = getTasksOfCard(card.id);

      const taskRecords = tasksToImport.map((task) => {
        const updatedAt = parseJSON(task.updatedAt);
        return {
          cardId: newCard.id,
          position: task.position,
          name: task.name,
          isCompleted: task.isCompleted,
          dueDate: parseJSON(task.dueDate),
          createdAt: parseJSON(task.createdAt),
          createdById: allUsers[task.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[task.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedTasks = await Task.createEach(taskRecords).fetch();

      await Promise.all(
        tasksToImport.map((task, i) => {
          importedTasks[task.id] = insertedTasks[i];
          return importTaskMemberships(insertedTasks[i], task);
        }),
      );
    };

    const importActions = async (newCard, card) => {
      const actionsToImport = getActionsOfCard(card.id);

      const actionRecords = actionsToImport.map((action) => {
        const newData = parseJSON(action.data);
        if (newData) {
          if (newData.listId) {
            newData.listId = importedLists[newData.listId]?.id ?? null;
          }
          if (newData.listFromId) {
            newData.listFromId = importedLists[newData.listFromId]?.id ?? null;
          }
          if (newData.listToId) {
            newData.listToId = importedLists[newData.listToId]?.id ?? null;
          }
          if (newData.cardPrevCoverAttachmentId) {
            newData.cardPrevCoverAttachmentId = importedAttachments[newData.cardPrevCoverAttachmentId]?.id ?? null;
          }
          if (newData.cardCoverAttachmentId) {
            newData.cardCoverAttachmentId = importedAttachments[newData.cardCoverAttachmentId]?.id ?? null;
          }
          if (newData.attachmentId) {
            newData.attachmentId = importedAttachments[newData.attachmentId]?.id ?? null;
          }
          if (newData.labelId) {
            newData.labelId = importedLabels[newData.labelId]?.id ?? null;
          }
          if (newData.cardLabelId) {
            newData.cardLabelId = importedCardLabels[newData.cardLabelId]?.id ?? null;
          }
          if (newData.taskId) {
            newData.taskId = importedTasks[newData.taskId]?.id ?? null;
          }
          if (newData.taskMembershipId) {
            newData.taskMembershipId = importedTaskMemberships[newData.taskMembershipId]?.id ?? null;
          }
          if (newData.cardMembershipId) {
            newData.cardMembershipId = importedCardMemberships[newData.cardMembershipId]?.id ?? null;
          }
          if (newData.userId) {
            newData.userId = allUsers[newData.userId]?.id ?? null;
          }
          if (newData.text && !allUsers[action.userId]) {
            newData.text = `${newData.text}\n\n---\n*Imported comment, original author: ${newData.userName ?? 'unknown'}*`;
          }
        }
        const updatedAt = parseJSON(action.updatedAt);

        return {
          cardId: newCard.id,
          userId: allUsers[action.userId]?.id ?? currentUser.id,
          scope: action.scope,
          type: action.type,
          data: newData,
          createdAt: parseJSON(action.createdAt),
          createdById: allUsers[action.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[action.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedActions = await Action.createEach(actionRecords).fetch();

      actionsToImport.forEach((action, i) => {
        importedActions[action.id] = insertedActions[i];
      });

      const insertedActionToUpdate = insertedActions.filter((action) => [Action.Types.CARD_COMMENT_CREATE, Action.Types.CARD_COMMENT_UPDATE, Action.Types.CARD_COMMENT_DELETE].includes(action.type));

      const updatedActions = insertedActionToUpdate.map((action) => {
        const updatedData = { ...action.data, commentActionId: importedActions[action.data.commentActionId]?.id ?? null };
        return { ...action, data: updatedData };
      });

      if (updatedActions.length) {
        await Promise.all(updatedActions.map((action) => Action.updateOne({ id: action.id }).set({ data: action.data })));
      }
    };

    const importCards = async (newList, list) => {
      const cardsToImport = getCardsOfList(list.id);

      const cardRecords = cardsToImport.map((card) => {
        const updatedAt = parseJSON(card.updatedAt);
        return {
          boardId: inputs.board.id,
          listId: newList.id,
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
          // TODO add original card author here, migration, cardCreate
        };
      });

      const insertedCards = await Card.createEach(cardRecords).fetch();

      await Promise.all(
        cardsToImport.map(async (card, i) => {
          const newCard = insertedCards[i];
          await Promise.all([importAttachments(newCard, card), importCardMemberships(newCard, card), importCardSubscriptions(newCard, card), importCardLabels(newCard, card), importTasks(newCard, card)]);
          await importActions(newCard, card);

          const coverAttachmentId = importedAttachments[card.coverAttachmentId]?.id ?? null;
          if (coverAttachmentId) {
            await Card.updateOne(newCard.id).set({ updatedAt: null, coverAttachmentId });
          }
        }),
      );
    };

    const importLists = async () => {
      const listRecords = lists.map((list) => {
        const updatedAt = parseJSON(list.updatedAt);
        return {
          boardId: inputs.board.id,
          name: list.name,
          position: list.position,
          isCollapsed: list.isCollapsed,
          createdAt: parseJSON(list.createdAt),
          createdById: allUsers[list.createdById]?.id ?? currentUser.id,
          updatedAt,
          updatedById: updatedAt && (allUsers[list.updatedById]?.id ?? currentUser.id),
        };
      });

      const insertedLists = await List.createEach(listRecords).fetch();

      await Promise.all(
        lists.map((list, i) => {
          importedLists[list.id] = insertedLists[i];
          return importCards(insertedLists[i], list);
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
