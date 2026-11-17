const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const sanitizeItem = require('../../utils/sanitize-item');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  EXPORT_ERROR: {
    exportError: 'Export error',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    skipMetadata: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipAttachments: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipUserAvatars: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipBackgroundsAndThumbnails: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    exportError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { project, board } = await sails.helpers.boards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, board.projectId);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const projectManagers = await sails.helpers.projects.getProjectManagers(board.projectId);
    const boardMemberships = await sails.helpers.boards.getBoardMemberships(board.id);
    const lists = await sails.helpers.boards.getLists(board.id);
    const cards = await sails.helpers.boards.getCards(board.id);
    const cardIds = sails.helpers.utils.mapRecords(cards);
    const comments = await sails.helpers.cards.getComments(cardIds);
    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    let actions = await Action.find({ boardId: board.id });
    if (inputs.skipActions) {
      actions = actions.filter((action) => action.type === Action.Types.CARD_CREATE || action.type === Action.Types.CARD_DUPLICATE);
    }
    let attachments = await sails.helpers.cards.getAttachments(cardIds);
    if (inputs.skipAttachments) {
      attachments = {};
    }
    const cardLabels = await sails.helpers.cards.getCardLabels(cardIds);
    const cardSubscriptions = await sails.helpers.cardSubscriptions.getMany({
      cardId: cardIds,
    });
    const labels = await sails.helpers.boards.getLabels(inputs.id);
    const tasks = await sails.helpers.cards.getTasks(cardIds);
    const taskIds = sails.helpers.utils.mapRecords(tasks);
    const taskMemberships = await sails.helpers.cards.getTaskMemberships(taskIds);

    const boardMembersipIds = sails.helpers.utils.mapRecords(boardMemberships, 'userId');
    const projectManagerIds = sails.helpers.utils.mapRecords(projectManagers, 'userId');
    const userIds = Array.from(new Set([...boardMembersipIds, ...projectManagerIds]));
    let users = await sails.helpers.users.getMany(userIds);
    users = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: currentUser.isAdmin ? user.email : undefined,
      avatar: !inputs.skipUserAvatars ? user.avatar : undefined,
    }));
    if (inputs.skipAttachments) {
      cards.forEach((card) => {
        card.coverAttachmentId = undefined; // eslint-disable-line no-param-reassign
      });
    }
    if (inputs.skipBackgroundsAndThumbnails) {
      project.backgroundImage = undefined;
      project.background = undefined;
      project.thumbnailImage = undefined;
      project.thumbnail = undefined;
      board.backgroundImage = undefined;
      board.background = undefined;
      board.thumbnailImage = undefined;
      board.thumbnail = undefined;
    }

    const data = {
      projects: project,
      projectManagers,
      boards: board,
      boardMemberships,
      lists,
      cards,
      comments,
      cardMemberships,
      actions,
      attachments,
      cardLabels,
      cardSubscriptions,
      labels,
      tasks,
      taskMemberships,
      users,
    };

    const csvFiles = {};

    await Promise.all(
      Object.entries(data).map(([key, value]) => {
        return new Promise((resolve) => {
          const csvStream = fastcsv.format({ headers: true });
          const chunks = [];

          csvStream.on('data', (chunk) => chunks.push(chunk));
          csvStream.on('end', () => {
            csvFiles[key] = Buffer.concat(chunks).toString('utf8');
            resolve();
          });

          const items = Array.isArray(value) ? value : [value];
          items.forEach((item) => {
            const sanitized = sanitizeItem(item, inputs.skipMetadata);
            const serializedItem = Object.fromEntries(Object.entries(sanitized).map(([k, v]) => [k, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]));
            csvStream.write(serializedItem);
          });
          csvStream.end();
        });
      }),
    );

    const exportDir = path.join(__dirname, '../../../private/exports', currentUser.id);
    const date = new Date().toISOString().replace(/[:]/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS
    const filename = `4gaBoards_${board.id}_${date}.tgz`;
    const tarPath = path.join(exportDir, filename);
    const tempDir = path.join(exportDir, `temp_${board.id}_${date}`);
    try {
      fs.mkdirSync(exportDir, { recursive: true });
      fs.mkdirSync(tempDir, { recursive: true });

      Object.entries(csvFiles).forEach(([key, value]) => {
        const filePath = path.join(tempDir, `${key}.csv`);
        fs.writeFileSync(filePath, value, 'utf8');
      });

      if (!inputs.skipAttachments) {
        await Promise.all(
          attachments.map(async (attachment) => {
            const attachmentDir = path.join(tempDir, 'attachments', attachment.dirname);
            fs.mkdirSync(attachmentDir, { recursive: true });
            const attachmentPath = path.join(sails.config.custom.attachmentsPath, attachment.dirname, attachment.filename);
            fs.copyFileSync(attachmentPath, path.join(attachmentDir, attachment.filename));
          }),
        );
      }

      if (!inputs.skipUserAvatars) {
        await Promise.all(
          users.map(async (user) => {
            if (user.avatar === null) return;
            const avatarDir = path.join(tempDir, 'user-avatars', user.avatar.dirname);
            fs.mkdirSync(avatarDir, { recursive: true });
            const avatarFilename = `original.${user.avatar.extension}`;
            const avatarPath = path.join(sails.config.custom.fullUserAvatarsPath, user.avatar.dirname, avatarFilename);
            fs.copyFileSync(avatarPath, path.join(avatarDir, avatarFilename));
          }),
        );
      }

      if (!inputs.skipBackgroundsAndThumbnails) {
        const copyProjectImage = (image, archiveDirectory) => {
          if (!image) return;
          const imageDirectory = path.join(tempDir, archiveDirectory, image.dirname);
          fs.mkdirSync(imageDirectory, { recursive: true });
          const imageFilename = `original.${image.extension}`;
          const imagePath = path.join(sails.config.custom.fullProjectBackgroundImagesPath, image.dirname, imageFilename);
          fs.copyFileSync(imagePath, path.join(imageDirectory, imageFilename));
        };

        copyProjectImage(project.backgroundImage, 'project-background-images');
        copyProjectImage(board.backgroundImage, 'board-background-images');
        copyProjectImage(project.thumbnailImage, 'project-thumbnail-images');
        copyProjectImage(board.thumbnailImage, 'board-thumbnail-images');
      }

      await tar.c(
        {
          gzip: true,
          file: tarPath,
          cwd: tempDir,
        },
        fs.readdirSync(tempDir),
      );
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      sails.log.error(error);
      throw Errors.EXPORT_ERROR;
    }

    return { item: `${sails.config.custom.exportsUrl}/${board.id}/${filename}` };
  },
};
