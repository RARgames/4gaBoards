const Errors = {
  INSTANCE_NOT_FOUND: {
    instanceNotFound: 'Instance not found',
  },
};

module.exports = {
  inputs: {
    beforeId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    instanceNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.INSTANCE_NOT_FOUND; // Forbidden
    }

    const actions = await sails.helpers.core.getActions(inputs.beforeId);
    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);

    return {
      items: actions,
      included: {
        users,
      },
    };
  },
};
