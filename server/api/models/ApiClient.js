/**
 * ApiClient.js
 *
 * @description :: Model for API clients
 */

const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

module.exports = {
  attributes: {
    name: {
      type: 'string',
    },
    label: {
      type: 'string',
    },
    clientId: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'client_id',
    },
    clientSecret: {
      type: 'string',
      required: true,
      columnName: 'client_secret',
    },
    permissions: {
      type: 'json',
      defaultsTo: [],
    },
    userId: {
      model: 'User',
      columnName: 'user_id',
    },
    lastUsedAt: {
      type: 'ref',
      columnName: 'last_used_at',
    },
    deletedAt: {
      type: 'ref',
      columnName: 'deleted_at',
    },
  },

  tableName: 'api_client',

  customToJSON() {
    const obj = { ...this };
    delete obj.clientSecret;
    return obj;
  },

  beforeCreate(valuesToSet, proceed) {
    sails.config.models.beforeCreate(valuesToSet, async () => {
      try {
        if (valuesToSet.clientSecret) {
          const hash = await bcrypt.hash(valuesToSet.clientSecret, SALT_ROUNDS);
          valuesToSet.clientSecret = hash; // eslint-disable-line no-param-reassign
        }
        return proceed();
      } catch (err) {
        return proceed(err);
      }
    });
  },

  beforeUpdate(valuesToSet, proceed) {
    sails.config.models.beforeUpdate(valuesToSet, async () => {
      if (valuesToSet.lastUsedAt) {
        delete valuesToSet.updatedAt; // eslint-disable-line no-param-reassign
      }

      try {
        if (valuesToSet.clientSecret) {
          const hash = await bcrypt.hash(valuesToSet.clientSecret, SALT_ROUNDS);
          valuesToSet.clientSecret = hash; // eslint-disable-line no-param-reassign
        }
        return proceed();
      } catch (err) {
        return proceed(err);
      }
    });
  },
};
