module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    return CalendarConnection.destroyOne({ id: inputs.record.id });
  },
};
