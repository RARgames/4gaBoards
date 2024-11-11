const fastcsv = require('fast-csv');
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
    user: {
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
    request: {
      type: 'ref',
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const loadCSV = (filename) =>
      new Promise((resolve, reject) => {
        try {
          const results = [];
          fs.createReadStream(path.join(inputs.importTempDir, `${filename}.csv`))
            .pipe(fastcsv.parse({ headers: true }))
            .on('data', (row) => results.push(row))
            .on('end', () => resolve(results))
            .on('error', reject);
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
          throw 'invalidFile';
        }
      });

    const [projectManagers, boardMemberships, lists, cards, cardMemberships, actions, attachments, cardLabels, cardSubscriptions, labels, tasks, taskMemberships, users] = await Promise.all([
      loadCSV('projectManagers'),
      loadCSV('boardMemberships'),
      loadCSV('lists'),
      loadCSV('cards'),
      loadCSV('cardMemberships'),
      loadCSV('actions'),
      loadCSV('attachments'),
      loadCSV('cardLabels'),
      loadCSV('cardSubscriptions'),
      loadCSV('labels'),
      loadCSV('tasks'),
      loadCSV('taskMemberships'),
      loadCSV('users'),
    ]);

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
            })
              .intercept(
                {
                  message: 'Unexpected error from database adapter: conflicting key value violates exclusion constraint "user_email_unique"',
                },
                'emailAlreadyInUse',
              )
              .fetch();

            allUsers[user.id] = newUser;
          }
        }),
      );
    };

    const importProjectManagers = async () => {
      return Promise.all(
        projectManagers.map(async (projectManager) => {
          if (allUsers[projectManager.userId]) {
            await ProjectManager.create({
              createdAt: parseJSON(projectManager.createdAt),
              updatedAt: parseJSON(projectManager.updatedAt),
              projectId: inputs.board.projectId,
              userId: allUsers[projectManager.userId].id,
            })
              .tolerate('E_UNIQUE')
              .fetch();
          }
        }),
      );
    };

    const importBoardMemberships = async () => {
      return Promise.all(
        boardMemberships.map(async (boardMembership) => {
          if (allUsers[boardMembership.userId]) {
            await BoardMembership.create({
              createdAt: parseJSON(boardMembership.createdAt),
              updatedAt: parseJSON(boardMembership.updatedAt),
              boardId: inputs.board.id,
              userId: allUsers[boardMembership.userId].id,
              role: boardMembership.role,
              ...(boardMembership.canComment !== '' && { canComment: boardMembership.canComment }),
            })
              .tolerate('E_UNIQUE')
              .fetch();

            sails.sockets.broadcast(
              `user:${allUsers[boardMembership.userId].id}`,
              'boardMembershipCreate',
              {
                item: boardMembership,
              },
              inputs.request,
            );
          }
        }),
      );
    };

    const importLabels = async () => {
      return Promise.all(
        labels.map(async (label) => {
          const newLabel = await Label.create({
            createdAt: parseJSON(label.createdAt),
            updatedAt: parseJSON(label.updatedAt),
            boardId: inputs.board.id,
            name: label.name || null,
            color: getLabelColor(label.color),
            position: label.position,
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

          const newAttachment = await Attachment.create({
            createdAt: parseJSON(attachment.createdAt),
            updatedAt: parseJSON(attachment.updatedAt),
            cardId: newCard.id,
            creatorUserId: allUsers[attachment.creatorUserId] ? allUsers[attachment.creatorUserId].id : inputs.user.id,
            // TODO add original attachment author here, migration, attachmentCreate
            name: attachment.name,
            image: parseJSON(attachment.image),
            filename: attachment.filename,
            dirname: fileData.dirname,
          }).fetch();

          importedAttachments[attachment.id] = newAttachment;
        }),
      );
    };

    const importCardMemberships = async (newCard, card) => {
      return Promise.all(
        getCardMembershipsOfCard(card.id).map(async (cardMembership) => {
          if (allUsers[cardMembership.userId]) {
            await CardMembership.create({
              createdAt: parseJSON(cardMembership.createdAt),
              updatedAt: parseJSON(cardMembership.updatedAt),
              cardId: newCard.id,
              userId: allUsers[cardMembership.userId].id,
            })
              .tolerate('E_UNIQUE')
              .fetch();
          }
        }),
      );
    };

    const importCardSubscriptions = async (newCard, card) => {
      return Promise.all(
        getCardSubscriptionsOfCard(card.id).map(async (cardSubscription) => {
          if (allUsers[cardSubscription.userId]) {
            await CardSubscription.create({
              createdAt: parseJSON(cardSubscription.createdAt),
              updatedAt: parseJSON(cardSubscription.updatedAt),
              cardId: newCard.id,
              userId: allUsers[cardSubscription.userId].id,
              isPermanent: cardSubscription.isPermanent,
            })
              .tolerate('E_UNIQUE')
              .fetch();
          }
        }),
      );
    };

    const importCardLabels = async (newCard, card) => {
      return Promise.all(
        getCardLabelsOfCard(card.id).map(async (cardLabel) => {
          if (importedLabels[cardLabel.labelId]) {
            await CardLabel.create({
              createdAt: parseJSON(cardLabel.createdAt),
              updatedAt: parseJSON(cardLabel.updatedAt),
              cardId: newCard.id,
              labelId: importedLabels[cardLabel.labelId].id,
            });
          }
        }),
      );
    };

    const importTaskMemberships = async (newTask, task) => {
      return Promise.all(
        getTaskMembershipsOfTask(task.id).map(async (taskMembership) => {
          if (allUsers[taskMembership.userId]) {
            await TaskMembership.create({
              createdAt: parseJSON(taskMembership.createdAt),
              updatedAt: parseJSON(taskMembership.updatedAt),
              taskId: newTask.id,
              userId: allUsers[taskMembership.userId].id,
            })
              .tolerate('E_UNIQUE')
              .fetch();
          }
        }),
      );
    };

    const importTasks = async (newCard, card) => {
      return Promise.all(
        getTasksOfCard(card.id).map(async (task) => {
          const newTask = await Task.create({
            createdAt: parseJSON(task.createdAt),
            updatedAt: parseJSON(task.updatedAt),
            cardId: newCard.id,
            position: task.position,
            name: task.name,
            isCompleted: task.isCompleted,
            dueDate: parseJSON(task.dueDate),
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

          await Action.create({
            createdAt: parseJSON(action.createdAt),
            updatedAt: parseJSON(action.updatedAt),
            cardId: newCard.id,
            userId: allUsers[action.userId] ? allUsers[action.userId].id : inputs.user.id,
            type: action.type,
            data: newData,
          }).fetch();
        }),
      );
    };

    const importCards = async (newList, list) => {
      return Promise.all(
        getCardsOfList(list.id).map(async (card) => {
          const newCard = await Card.create({
            createdAt: parseJSON(card.createdAt),
            boardId: inputs.board.id,
            listId: newList.id,
            creatorUserId: allUsers[card.creatorUserId] ? allUsers[card.creatorUserId].id : inputs.user.id,
            // TODO add original card author here, migration, cardCreate
            position: card.position,
            name: card.name,
            description: card.description || null,
            dueDate: parseJSON(card.dueDate),
            commentCount: card.commentCount,
            timer: parseJSON(card.timer),
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
          const newList = await List.create({
            createdAt: parseJSON(list.createdAt),
            updatedAt: parseJSON(list.updatedAt),
            boardId: inputs.board.id,
            name: list.name,
            position: list.position,
            isCollapsed: list.isCollapsed,
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

    fs.rmSync(inputs.importTempDir, { recursive: true, force: true });
    fs.rmSync(inputs.importFilePath, { force: true });
  },
};
