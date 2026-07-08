const fs = require('fs');
const path = require('path');

const Errors = {
  DOCUMENT_NOT_FOUND: {
    documentNotFound: 'Document not found',
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
    documentNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const document = await sails.helpers.documents.getOne({ id: inputs.id });

    if (!document) {
      throw Errors.DOCUMENT_NOT_FOUND;
    }

    const { isAdmin, isManager, isMember } = await sails.helpers.projects.getMembershipContext.with({ projectId: document.projectId, currentUser });

    if (!isAdmin && !isManager && !isMember) {
      throw Errors.DOCUMENT_NOT_FOUND; // Forbidden
    }

    const filePath = path.join(sails.config.custom.documentsPath, document.dirname, document.filename);

    if (!fs.existsSync(filePath)) {
      throw Errors.DOCUMENT_NOT_FOUND;
    }

    this.res.type(document.filename);
    if (!document.image && path.extname(document.filename) !== '.pdf') {
      this.res.set('Content-Disposition', 'attachment');
    }
    this.res.set('Cache-Control', `private, max-age=${sails.config.custom.cacheMaxAge}`);

    return exits.success(fs.createReadStream(filePath));
  },
};
