/**
 * ApiClient.js
 *
 * @description :: Model for API clients (mailbot user auth).
 */

module.exports = {
  attributes: {
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
  },

  tableName: 'api_client',
};
