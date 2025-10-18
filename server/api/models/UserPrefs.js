/**
 * UserPrefs.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const DESCRIPTION_MODES = ['edit', 'live', 'preview'];
const VIEW_MODES = ['board', 'list'];
const LIST_STYLES = ['default', 'compact'];
const LIST_ITEMS_PER_PAGE = ['25', '50', '100', '250', '500', '1000', 'all'];
const PREFERRED_FONTS = ['default', 'monospace'];
const THEME_SHAPES = ['default', 'rounded'];
const THEMES = ['default', 'github-dark'];

module.exports = {
  DESCRIPTION_MODES,
  VIEW_MODES,
  LIST_STYLES,
  LIST_ITEMS_PER_PAGE,
  PREFERRED_FONTS,
  THEME_SHAPES,
  THEMES,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    language: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    subscribeToOwnCards: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'subscribe_to_own_cards',
    },
    descriptionMode: {
      type: 'string',
      isIn: DESCRIPTION_MODES,
      isNotEmptyString: true,
      columnName: 'description_mode',
      defaultsTo: 'edit',
    },
    commentMode: {
      type: 'string',
      isIn: DESCRIPTION_MODES,
      isNotEmptyString: true,
      columnName: 'comment_mode',
      defaultsTo: 'edit',
    },
    descriptionShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'description_shown',
    },
    tasksShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'tasks_shown',
    },
    attachmentsShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'attachments_shown',
    },
    commentsShown: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'comments_shown',
    },
    sidebarCompact: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'sidebar_compact',
    },
    defaultView: {
      type: 'string',
      isIn: VIEW_MODES,
      isNotEmptyString: true,
      columnName: 'default_view',
      defaultsTo: 'board',
    },
    listViewStyle: {
      type: 'string',
      isIn: LIST_STYLES,
      isNotEmptyString: true,
      columnName: 'list_view_style',
      defaultsTo: 'compact',
    },
    listViewColumnVisibility: {
      type: 'json',
      columnName: 'list_view_column_visibility',
      defaultsTo: {
        notificationsCount: true,
        coverUrl: false,
        name: true,
        labels: true,
        users: true,
        listName: true,
        hasDescription: true,
        attachmentsCount: true,
        commentCount: true,
        dueDate: true,
        closestDueDate: true,
        timer: true,
        tasks: true,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
        description: false,
        actions: true,
      },
    },
    listViewFitScreen: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'list_view_fit_screen',
    },
    listViewItemsPerPage: {
      type: 'string',
      isIn: LIST_ITEMS_PER_PAGE,
      isNotEmptyString: true,
      columnName: 'list_view_items_per_page',
      defaultsTo: 'all',
    },
    usersSettingsStyle: {
      type: 'string',
      isIn: LIST_STYLES,
      isNotEmptyString: true,
      columnName: 'users_settings_style',
      defaultsTo: 'compact',
    },
    usersSettingsColumnVisibility: {
      type: 'json',
      columnName: 'users_settings_column_visibility',
      defaultsTo: {
        avatar: true,
        name: true,
        username: true,
        email: true,
        administrator: true,
        ssoGoogleEmail: false,
        ssoGithubUsername: false,
        ssoGithubEmail: false,
        ssoMicrosoftEmail: false,
        ssoOidcEmail: false,
        lastLogin: true,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
        actions: true,
      },
    },
    usersSettingsFitScreen: {
      type: 'boolean',
      defaultsTo: true,
      columnName: 'users_settings_fit_screen',
    },
    usersSettingsItemsPerPage: {
      type: 'string',
      isIn: LIST_ITEMS_PER_PAGE,
      isNotEmptyString: true,
      columnName: 'users_settings_items_per_page',
      defaultsTo: 'all',
    },
    preferredDetailsFont: {
      type: 'string',
      isIn: PREFERRED_FONTS,
      isNotEmptyString: true,
      columnName: 'preferred_details_font',
      defaultsTo: 'default',
    },
    hideCardModalActivity: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'hide_card_modal_activity',
    },
    hideClosestDueDate: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'hide_closest_due_date',
    },
    theme: {
      type: 'string',
      isIn: THEMES,
      isNotEmptyString: true,
      columnName: 'theme',
      defaultsTo: 'default',
    },
    themeShape: {
      type: 'string',
      isIn: THEME_SHAPES,
      isNotEmptyString: true,
      columnName: 'theme_shape',
      defaultsTo: 'default',
    },
  },

  tableName: 'user_prefs',
};
