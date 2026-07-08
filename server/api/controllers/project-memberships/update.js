const Errors = {
  PROJECT_MEMBERSHIP_NOT_FOUND: {
    projectMembershipNotFound: 'Project membership not found',
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
    canEditWiki: {
      type: 'boolean',
    },
    canManageDocuments: {
      type: 'boolean',
    },
  },

  exits: {
    projectMembershipNotFound: {
      responseType: 'notFound',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectMembership = await sails.helpers.projectMemberships.getOne(inputs.id);

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    const isManager = await sails.helpers.users.isProjectManager(currentUser.id, projectMembership.projectId);

    if (!currentUser.isAdmin && !isManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['canEditWiki', 'canManageDocuments']);

    projectMembership = await sails.helpers.projectMemberships.updateOne.with({
      values,
      record: projectMembership,
      currentUser,
      request: this.req,
    });

    return {
      item: projectMembership,
    };
  },
};
