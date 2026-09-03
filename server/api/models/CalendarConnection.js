/**
 * CalendarConnection.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Providers = {
  GOOGLE: 'google',
};

const Statuses = {
  ACTIVE: 'active',
  ERROR: 'error',
};

module.exports = {
  Providers,
  Statuses,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    provider: {
      type: 'string',
      isIn: Object.values(Providers),
      required: true,
    },
    accountEmail: {
      type: 'string',
      required: true,
      columnName: 'account_email',
    },
    // Encrypted at rest by sails.helpers.utils.encryptSecret - never read these directly, and
    // never return them from a controller.
    refreshToken: {
      type: 'string',
      required: true,
      columnName: 'refresh_token',
    },
    accessToken: {
      type: 'string',
      allowNull: true,
      columnName: 'access_token',
    },
    accessTokenExpiresAt: {
      type: 'ref',
      columnType: 'timestamp',
      columnName: 'access_token_expires_at',
    },
    status: {
      type: 'string',
      isIn: Object.values(Statuses),
      defaultsTo: Statuses.ACTIVE,
    },
    lastError: {
      type: 'string',
      allowNull: true,
      columnName: 'last_error',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    createdById: {
      model: 'User',
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  tableName: 'calendar_connection',
};
