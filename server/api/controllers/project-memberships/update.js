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
    isCollapsed: {
      type: 'boolean',
    },
    isSubscribed: {
      type: 'boolean',
    },
  },

  exits: {
    projectMembershipNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let projectMembership = await ProjectMembership.findOne({
      projectId: inputs.projectId,
      userId: currentUser.id,
    });

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    const values = _.pick(inputs, ['isCollapsed', 'isSubscribed']);

    projectMembership = await sails.helpers.projectMemberships.updateOne.with({
      values,
      record: projectMembership,
      currentUser,
      request: this.req,
    });

    if (!projectMembership) {
      throw Errors.PROJECT_MEMBERSHIP_NOT_FOUND;
    }

    return {
      item: projectMembership,
    };
  },
};
