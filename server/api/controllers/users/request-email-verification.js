const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  COOLDOWN_ACTIVE: {
    cooldownActive: 'Please wait before requesting another verification email',
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
    cooldownActive: {
      responseType: 'tooManyRequests',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin && inputs.id !== currentUser.id) {
      throw Errors.USER_NOT_FOUND;
    }

    const user = await sails.helpers.users.getOne(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    if (user.lastEmailVerificationRequestAt) {
      const timeSinceLastRequest = Date.now() - new Date(user.lastEmailVerificationRequestAt).getTime();
      if (timeSinceLastRequest < sails.config.custom.emailVerificationCooldownMs) {
        throw Errors.COOLDOWN_ACTIVE;
      }
    }

    await sails.helpers.users.updateOne.with({
      record: user,
      values: {
        lastEmailVerificationRequestAt: new Date().toUTCString(),
      },
      currentUser,
      request: this.req,
    });

    await sails.helpers.users.requestEmailVerification.with({
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
