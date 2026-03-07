/**
 * ApiClient.js
 *
 * @description :: Model for API clients
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true,
    },
    label: {
      type: 'string',
      required: true,
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
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },

  tableName: 'api_client',
};
