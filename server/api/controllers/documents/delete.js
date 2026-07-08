const Errors = {
  DOCUMENT_NOT_FOUND: {
    documentNotFound: 'Document not found',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const document = await sails.helpers.documents.getOne({ id: inputs.id });

    if (!document) {
      throw Errors.DOCUMENT_NOT_FOUND;
    }

    const { isAdmin, isManager } = await sails.helpers.projects.getMembershipContext.with({ projectId: document.projectId, currentUser });

    if (!isAdmin && !isManager && document.createdById !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const deletedDocument = await sails.helpers.documents.deleteOne.with({
      record: document,
      request: this.req,
    });

    return {
      item: deletedDocument,
    };
  },
};
