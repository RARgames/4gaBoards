module.exports = {
  inputs: {
    maxAgeMs: {
      type: 'number',
      required: true,
    },
  },

  async fn(inputs) {
    const cutoff = new Date(Date.now() - inputs.maxAgeMs).toUTCString();

    await FailedAuth.destroy({
      createdAt: {
        '<': cutoff,
      },
    });
  },
};
