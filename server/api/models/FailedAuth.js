module.exports = {
  attributes: {
    attemptedIdentifier: {
      type: 'string',
      required: true,
      columnName: 'attempted_identifier',
    },
    remoteAddress: {
      type: 'string',
      required: true,
      columnName: 'remote_address',
    },
  },

  tableName: 'failed_auth',
};
