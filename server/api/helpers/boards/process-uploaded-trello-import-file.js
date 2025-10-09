const fs = require('fs').promises;
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const content = await fs.readFile(inputs.file.fd);
    const trelloBoard = JSON.parse(content);

    if (!trelloBoard || !_.isArray(trelloBoard.lists) || !_.isArray(trelloBoard.cards) || !_.isArray(trelloBoard.checklists) || !_.isArray(trelloBoard.actions)) {
      throw 'invalidFile';
    }

    try {
      rimraf.sync(inputs.file.fd);
    } catch (error) {
      sails.log.warn(error.stack);
    }

    return trelloBoard;
  },
};
