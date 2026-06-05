const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

const CURRENT_USER_ID = 'me';

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+|me$/,
      required: true,
    },
    subscribe: {
      type: 'boolean',
    },
  },

  exits: {
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let user;
    if (inputs.id === CURRENT_USER_ID) {
      user = currentUser;

      if (inputs.subscribe && this.req.isSocket) {
        sails.sockets.join(this.req, `user:${user.id}`);
      }
    } else {
      user = await sails.helpers.users.getOne(inputs.id);

      if (!user) {
        throw Errors.USER_NOT_FOUND;
      }
    }

    const sanitizedUser = await sails.helpers.users.sanitize(user, currentUser);

    return {
      item: sanitizedUser,
    };
  },
};
