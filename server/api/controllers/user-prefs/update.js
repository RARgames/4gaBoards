const Errors = {
  USER_PREFS_NOT_FOUND: {
    userPrefsNotFound: 'User prefs not found',
  },
  USER_NOT_FOUND: {
    userNotFound: 'User not found',
  },
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+|me$/,
      required: true,
    },
    language: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
    },
    descriptionMode: {
      type: 'string',
      isIn: UserPrefs.DESCRIPTION_MODES,
      isNotEmptyString: true,
    },
    commentMode: {
      type: 'string',
      isIn: UserPrefs.DESCRIPTION_MODES,
      isNotEmptyString: true,
    },
    descriptionShown: {
      type: 'boolean',
    },
    tasksShown: {
      type: 'boolean',
    },
    attachmentsShown: {
      type: 'boolean',
    },
    commentsShown: {
      type: 'boolean',
    },
    sidebarCompact: {
      type: 'boolean',
    },
  },

  exits: {
    userPrefsNotFound: {
      responseType: 'notFound',
    },
    userNotFound: {
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

    let userPrefs = await sails.helpers.userPrefs.getOne(currentUser.id);
    if (!userPrefs) {
      throw Errors.USER_PREFS_NOT_FOUND;
    }

    const values = {
      ..._.pick(inputs, ['language', 'subscribeToOwnCards', 'descriptionMode', 'commentMode', 'descriptionShown', 'tasksShown', 'attachmentsShown', 'commentsShown', 'sidebarCompact']),
    };

    userPrefs = await sails.helpers.userPrefs.updateOne.with({
      values,
      record: currentUser,
      request: this.req,
    });

    if (!userPrefs) {
      throw Errors.USER_PREFS_NOT_FOUND;
    }

    return {
      item: userPrefs,
    };
  },
};
