/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
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
    passwordChangedAt: {
      type: 'ref',
      columnName: 'password_changed_at',
    },
    ssoGoogleId: {
      type: 'string',
      columnName: 'sso_google_id',
      allowNull: true,
    },
    ssoGoogleEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'sso_google_email',
      allowNull: true,
    },
    ssoGithubId: {
      type: 'string',
      columnName: 'sso_github_id',
      allowNull: true,
    },
    ssoGithubUsername: {
      type: 'string',
      columnName: 'sso_github_username',
      allowNull: true,
    },
    ssoGithubEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'sso_github_email',
      allowNull: true,
    },
    ssoMicrosoftId: {
      type: 'string',
      columnName: 'sso_microsoft_id',
      allowNull: true,
    },
    ssoMicrosoftEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'sso_microsoft_email',
      allowNull: true,
    },
    ssoOidcId: {
      type: 'string',
      columnName: 'sso_oidc_id',
      allowNull: true,
    },
    ssoOidcEmail: {
      type: 'string',
      isEmail: true,
      columnName: 'sso_oidc_email',
      allowNull: true,
    },
    lastLogin: {
      type: 'ref',
      columnName: 'last_login',
    },
    deletedAt: {
      type: 'ref',
      columnName: 'deleted_at',
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
    membershipTasks: {
      collection: 'Task',
      via: 'userId',
      through: 'TaskMembership',
    },
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
    deletedById: {
      model: 'User',
      columnName: 'deleted_by_id',
    },
  },

  tableName: 'user_account',

  customToJSON() {
    return {
      ..._.omit(this, ['password', 'avatar', 'passwordChangedAt', 'ssoGoogleId', 'ssoGithubId', 'ssoMicrosoftId', 'ssoOidcId']),
      isPasswordAuthenticated: !!this.password,
      avatarUrl: this.avatar && `${sails.config.custom.userAvatarsUrl}/${this.avatar.dirname}/square-100.${this.avatar.extension}`,
    };
  },

  async beforeUpdate(record, proceed) {
    sails.config.models.beforeUpdate(record, () => {
      if (record.lastLogin) {
        delete record.updatedById; // eslint-disable-line no-param-reassign
        delete record.updatedAt; // eslint-disable-line no-param-reassign
      }

      proceed();
    });
  },
};
