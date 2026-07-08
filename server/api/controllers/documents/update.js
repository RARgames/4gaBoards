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
    name: {
      type: 'string',
      isNotEmptyString: true,
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    folder: {
      type: 'string',
      allowNull: true,
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

    const { isAdmin, isManager, membership } = await sails.helpers.projects.getMembershipContext.with({ projectId: document.projectId, currentUser });

    if (!isAdmin && !isManager && !(membership && membership.canManageDocuments)) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['name', 'description', 'folder']);

    const updatedDocument = await sails.helpers.documents.updateOne.with({
      record: document,
      values,
      currentUser,
      request: this.req,
    });

    return {
      item: updatedDocument,
    };
  },
};
