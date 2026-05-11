const Errors = {
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
};

module.exports = {
  inputs: {
    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    isVerified: {
      type: 'boolean',
      required: true,
    },
  },

  exits: {
    insufficientPermissions: {
      responseType: 'forbidden',
    },
    userNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { apiClient } = this.req;

    if (!apiClient || apiClient.label !== sails.config.custom.notificationsInternalApiClientLabel) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    const email = inputs.email.toLowerCase();
    let user = await sails.helpers.users.getOne({ email });
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    user = await sails.helpers.users.updateOne.with({
      record: user,
      values: {
        isVerified: inputs.isVerified,
      },
      currentUser: user,
      request: this.req,
    });

    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    return {
      item: user,
    };
  },
};
