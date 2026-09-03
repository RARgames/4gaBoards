module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    return LinkedCalendar.destroyOne({ id: inputs.record.id });
  },
};
