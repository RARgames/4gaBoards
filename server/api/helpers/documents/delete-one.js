const path = require('path');
const rimraf = require('rimraf');

module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const document = await Document.destroyOne(inputs.record.id);

    if (document) {
      try {
        rimraf.sync(path.join(sails.config.custom.documentsPath, document.dirname));
      } catch (error) {
        sails.log.warn(error.stack);
      }

      sails.sockets.broadcast(`project:${document.projectId}`, 'documentDelete', { item: document }, inputs.request);
    }

    return document;
  },
};
