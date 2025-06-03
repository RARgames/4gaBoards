const Errors = {
  USER_PREFS_NOT_FOUND: {
    userPrefsNotFound: 'User prefs not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
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
    userPrefsNotFound: {
      responseType: 'notFound',
    },
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (inputs.id !== currentUser.id) {
      throw Errors.INSUFFICIENT_PERMISSIONS;
    }

    const userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: currentUser.id }, currentUser });

    if (!userPrefs) {
      throw Errors.USER_PREFS_NOT_FOUND;
    }

    return {
      item: userPrefs,
    };
  },
};
