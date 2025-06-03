module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const userPrefs = await UserPrefs.destroy({ id: inputs.record.id });

    return userPrefs;
  },
};
