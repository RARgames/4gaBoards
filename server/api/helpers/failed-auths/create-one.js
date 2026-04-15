module.exports = {
  inputs: {
    attemptedIdentifier: {
      type: 'string',
      required: true,
    },
    remoteAddress: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    await FailedAuth.create({
      attemptedIdentifier: inputs.attemptedIdentifier,
      remoteAddress: inputs.remoteAddress,
    }).fetch();
  },
};
