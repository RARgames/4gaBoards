module.exports = {
  inputs: {
    id: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    return TimeEntry.findOne(inputs.id);
  },
};
