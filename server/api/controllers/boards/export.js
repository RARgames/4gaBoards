const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const tar = require('tar');

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
    const cardMemberships = await sails.helpers.cards.getCardMemberships(cardIds);
    const actions = await Action.find({ cardId: cardIds });
    const attachments = await sails.helpers.cards.getAttachments(cardIds);
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
      email: user.email,
      avatar: user.avatar,
    }));

    const data = {
      project,
      projectManagers,
      board,
      boardMemberships,
      lists,
      cards,
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
            const serializedItem = Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]));
            csvStream.write(serializedItem);
          });
          csvStream.end();
        });
      }),
    );

    const exportDir = path.join(__dirname, '../../../private/exports', currentUser.id);
    const date = new Date().toISOString().replace(/[:]/g, '-').split('.')[0]; // Format: YYYY-MM-DDTHH-MM-SS
    const filename = `4gaBoards_${inputs.id}_${date}.tar.gz`;
    const tarPath = path.join(exportDir, filename);
    const tempDir = path.join(exportDir, `temp_${inputs.id}_${date}`);
    try {
      fs.mkdirSync(exportDir, { recursive: true });
      fs.mkdirSync(tempDir, { recursive: true });

      Object.entries(csvFiles).forEach(([key, value]) => {
        const filePath = path.join(tempDir, `${key}.csv`);
        fs.writeFileSync(filePath, value, 'utf8');
      });

      await Promise.all(
        attachments.map(async (attachment) => {
          const attachmentDir = path.join(tempDir, 'attachments', attachment.dirname);
          fs.mkdirSync(attachmentDir, { recursive: true });
          const attachmentPath = path.join(sails.config.custom.attachmentsPath, attachment.dirname, attachment.filename);
          fs.copyFileSync(attachmentPath, path.join(attachmentDir, attachment.filename));
        }),
      );

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

      if (project.backgroundImage !== null) {
        const projectBackgroundDir = path.join(tempDir, 'project-background-images', project.backgroundImage.dirname);
        fs.mkdirSync(projectBackgroundDir, { recursive: true });
        const projectBackgroundFilename = `original.${project.backgroundImage.extension}`;
        const projectBackgroundPath = path.join(sails.config.custom.fullProjectBackgroundImagesPath, project.backgroundImage.dirname, projectBackgroundFilename);
        fs.copyFileSync(projectBackgroundPath, path.join(projectBackgroundDir, projectBackgroundFilename));
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
      console.error(error); // eslint-disable-line no-console
      throw Errors.EXPORT_ERROR;
    }

    return { item: `${sails.config.custom.exportsUrl}/${board.id}/${filename}` };
  },
};
