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
    windowMs: {
      type: 'number',
      required: true,
    },
  },

  async fn(inputs) {
    const cutoff = new Date(Date.now() - inputs.windowMs).toUTCString();

    return FailedAuth.count({
      attemptedIdentifier: inputs.attemptedIdentifier,
      remoteAddress: inputs.remoteAddress,
      createdAt: {
        '>=': cutoff,
      },
    });
  },
};
