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

const columnVisibilityValidator = (value) => _.isObject(value) && _.every(value, (v) => typeof v === 'boolean');

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
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
    defaultView: {
      type: 'string',
      isIn: UserPrefs.VIEW_MODES,
      isNotEmptyString: true,
    },
    listViewStyle: {
      type: 'string',
      isIn: UserPrefs.LIST_STYLES,
      isNotEmptyString: true,
    },
    listViewColumnVisibility: {
      type: 'json',
      custom: columnVisibilityValidator,
    },
    listViewFitScreen: {
      type: 'boolean',
    },
    listViewItemsPerPage: {
      type: 'string',
      isIn: UserPrefs.LIST_ITEMS_PER_PAGE,
      isNotEmptyString: true,
    },
    usersSettingsStyle: {
      type: 'string',
      isIn: UserPrefs.LIST_STYLES,
      isNotEmptyString: true,
    },
    usersSettingsColumnVisibility: {
      type: 'json',
      custom: columnVisibilityValidator,
    },
    usersSettingsFitScreen: {
      type: 'boolean',
    },
    usersSettingsItemsPerPage: {
      type: 'string',
      isIn: UserPrefs.LIST_ITEMS_PER_PAGE,
      isNotEmptyString: true,
    },
    preferredDetailsFont: {
      type: 'string',
      isIn: UserPrefs.PREFERRED_FONTS,
      isNotEmptyString: true,
    },
    hideCardModalActivity: {
      type: 'boolean',
    },
    hideClosestDueDate: {
      type: 'boolean',
    },
    theme: {
      type: 'string',
      isIn: UserPrefs.THEMES,
      isNotEmptyString: true,
    },
    themeShape: {
      type: 'string',
      isIn: UserPrefs.THEME_SHAPES,
      isNotEmptyString: true,
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

    let userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: currentUser.id }, currentUser });
    if (!userPrefs) {
      throw Errors.USER_PREFS_NOT_FOUND;
    }

    const values = {
      ..._.pick(inputs, [
        'language',
        'subscribeToOwnCards',
        'descriptionMode',
        'commentMode',
        'descriptionShown',
        'tasksShown',
        'attachmentsShown',
        'commentsShown',
        'sidebarCompact',
        'defaultView',
        'listViewStyle',
        'listViewColumnVisibility',
        'listViewFitScreen',
        'listViewItemsPerPage',
        'usersSettingsStyle',
        'usersSettingsColumnVisibility',
        'usersSettingsFitScreen',
        'usersSettingsItemsPerPage',
        'preferredDetailsFont',
        'hideCardModalActivity',
        'hideClosestDueDate',
        'theme',
        'themeShape',
      ]),
    };

    userPrefs = await sails.helpers.userPrefs.updateOne.with({
      values,
      record: currentUser,
      currentUser,
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
