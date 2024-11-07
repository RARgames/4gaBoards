const fs = require('fs');
const path = require('path');

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  FILE_NOT_FOUND: {
    fileNotFound: 'File not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    filename: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    boardNotFound: {
      responseType: 'notFound',
    },
    fileNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { board } = await sails.helpers.boards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, board.projectId);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const filePath = path.join(sails.config.custom.exportsPath, currentUser.id, inputs.filename);

    if (!fs.existsSync(filePath)) {
      throw Errors.FILE_NOT_FOUND;
    }

    this.res.type(inputs.filename);
    this.res.set('Content-Disposition', 'attachment');
    this.res.set('Cache-Control', `private, max-age=${sails.config.custom.cacheMaxAge}`);
    const fileStream = fs.createReadStream(filePath);

    // Remove the file after download
    fileStream.on('close', () => {
      fs.unlink(filePath, () => {});
    });
    fileStream.on('end', () => {
      fs.unlink(filePath, () => {});
    });
    fileStream.on('error', () => {
      fs.unlink(filePath, () => {});
    });
    // TODO unlink might be unsuccessful, there might be other issues so periodic cleanup might be needed

    return exits.success(fileStream);
  },
};
