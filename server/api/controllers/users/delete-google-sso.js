const Errors = {
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  UPDATE_FAILED: {
    updateFailed: 'Failed to update user',
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
    updateFailed: {
      responseType: 'badRequest',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    let user = await sails.helpers.users.getOne(inputs.id);
    if (!user) {
      throw Errors.USER_NOT_FOUND;
    }

    const values = { ssoGoogleEmail: null };

    // Assuming `ssoGoogleEmail` can be set to null to indicate it's removed.
    user = await sails.helpers.users.updateOne.with({
      values,
      record: user,
      user: currentUser,
      request: this.req,
    });

    return {
      item: user,
    };
  },
};
