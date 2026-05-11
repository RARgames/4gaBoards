const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    beforeId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.USER_NOT_FOUND; // Forbidden
    }

    const actions = await sails.helpers.users.getUserActions(inputs.userId, inputs.beforeId);

    const memberProjectIds = await sails.helpers.users.getMembershipProjectIds(currentUser.id);
    const filteredActions = actions.filter((action) => {
      if (!action.projectId) {
        return true;
      }
      return memberProjectIds.includes(action.projectId);
    });

    const userIds = sails.helpers.utils.mapRecords(filteredActions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);

    if (this.req.isSocket) {
      sails.sockets.join(this.req, `user:${inputs.userId}`);
    }

    return {
      items: filteredActions,
      included: {
        users,
      },
    };
  },
};
