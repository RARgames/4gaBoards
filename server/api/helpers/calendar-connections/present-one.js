// The shape a connection takes on the wire. Tokens are deliberately absent: nothing outside the
// server has any use for them, and an admin panel is still a browser.
module.exports = {
  sync: true,

  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  fn(inputs) {
    return _.pick(inputs.record, ['id', 'provider', 'accountEmail', 'status', 'lastError', 'createdAt', 'updatedAt']);
  },
};
