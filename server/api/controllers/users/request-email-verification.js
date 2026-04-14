const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
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
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin && inputs.id === currentUser.id) {
      throw Errors.USER_NOT_FOUND;
    }

    const user = await sails.helpers.users.getOne(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    await sails.helpers.notifications.requestEmailVerification.with({
      values: {
        user,
        reason: 'manual',
      },
      currentUser,
      request: this.req,
    });

    return {
      item: user,
    };
  },
};
