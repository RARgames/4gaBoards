const path = require('path');
const rimraf = require('rimraf');
const util = require('util');
const { v4: uuid } = require('uuid');

const Errors = {
  BOARD_NOT_FOUND: { boardNotFound: 'Board not found' },
  NO_FILE_WAS_UPLOADED: { noFileWasUploaded: 'No file was uploaded' },
  FILE_IS_NOT_IMAGE: { fileIsNotImage: 'File is not image' },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    target: {
      type: 'string',
      isIn: ['background', 'thumbnail'],
      defaultsTo: 'background',
    },
  },

  exits: {
    boardNotFound: { responseType: 'notFound' },
    noFileWasUploaded: { responseType: 'unprocessableEntity' },
    fileIsNotImage: { responseType: 'unprocessableEntity' },
    uploadError: { responseType: 'unprocessableEntity' },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    let board = await Board.findOne(inputs.id);

    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, board.projectId);

    if (!isProjectManager) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    const upload = util.promisify((options, callback) => this.req.file('file').upload(options, (error, files) => callback(error, files)));

    let files;
    try {
      files = await upload({
        saveAs: uuid(),
        maxBytes: sails.config.custom.uploadLimits.projectBackgroundImageMaxBytes,
      });
    } catch (error) {
      return exits.uploadError(error.message); // TODO: add error
    }

    if (files.length === 0) {
      throw Errors.NO_FILE_WAS_UPLOADED;
    }

    const file = _.last(files);

    const fileData = await sails.helpers.projects.processUploadedBackgroundImageFile(file).intercept('fileIsNotImage', () => {
      try {
        rimraf.sync(file.fd);
      } catch (error) {
        sails.log.warn(error.stack);
      }
      return Errors.FILE_IS_NOT_IMAGE;
    });

    board = await sails.helpers.boards.updateOne.with({
      record: board,
      values: { [inputs.target === 'thumbnail' ? 'thumbnailImage' : 'backgroundImage']: fileData },
      currentUser,
      request: this.req,
    });

    if (!board) {
      rimraf.sync(path.join(sails.config.custom.projectBackgroundImagesPath, fileData.dirname));
      throw Errors.BOARD_NOT_FOUND;
    }

    return exits.success({
      item: board,
    });
  },
};
