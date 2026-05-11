const Errors = {
  PROJECT_MEMBERSHIP_NOT_FOUND: {
    projectMembershipNotFound: 'Project membership not found',
  },
};

module.exports = {
  inputs: {
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    projectMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const projectMembership = await sails.helpers.projectMemberships.getOne({ userId: currentUser.id, projectId: inputs.projectId });

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: projectMembership,
    };
  },
};
