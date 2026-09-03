module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    message: {
      type: 'string',
      required: true,
    },
  },

  async fn(inputs) {
    sails.log.warn('Google Calendar: connection unusable', inputs.record.id, inputs.record.accountEmail, inputs.message);

    return CalendarConnection.updateOne({ id: inputs.record.id }).set({ status: CalendarConnection.Statuses.ERROR, lastError: inputs.message });
  },
};
