/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const DESCRIPTION_MODES = ['edit', 'live', 'preview'];

module.exports = {
  DESCRIPTION_MODES,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    email: {
      type: 'string',
      isEmail: true,
      required: true,
    },
    password: {
      type: 'string',
      allowNull: true,
    },
    isAdmin: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_admin',
    },
    name: {
      type: 'string',
      required: true,
    },
    username: {
      type: 'string',
      isNotEmptyString: true,
      minLength: 3,
      maxLength: 16,
      regex: /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/,
      allowNull: true,
    },
    avatar: {
      type: 'json',
    },
    phone: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    organization: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
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
    deletedAt: {
      type: 'ref',
      columnName: 'deleted_at',
    },
    passwordChangedAt: {
      type: 'ref',
      columnName: 'password_changed_at',
    },
    ssoGoogleEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'sso_google_email',
      allowNull: true,
    },
    lastLogin: {
      type: 'ref',
      columnName: 'last_login',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    managerProjects: {
      collection: 'Project',
      via: 'userId',
      through: 'ProjectManager',
    },
    membershipBoards: {
      collection: 'Board',
      via: 'userId',
      through: 'BoardMembership',
    },
    subscriptionCards: {
      collection: 'Card',
      via: 'userId',
      through: 'CardSubscription',
    },
    membershipCards: {
      collection: 'Card',
      via: 'userId',
      through: 'CardMembership',
    },
  },

  tableName: 'user_account',

  customToJSON() {
    return {
      ..._.omit(this, ['password', 'avatar', 'passwordChangedAt']),
      avatarUrl: this.avatar && `${sails.config.custom.userAvatarsUrl}/${this.avatar.dirname}/square-100.${this.avatar.extension}`,
    };
  },
};
