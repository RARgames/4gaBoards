module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { record } = inputs;
    const mailCopy = { ...record };

    await Mail.destroyOne({ id: record.id });

    return mailCopy;
  },
};
