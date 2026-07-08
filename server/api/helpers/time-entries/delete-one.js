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
    const timeEntry = await TimeEntry.destroyOne(inputs.record.id);

    if (timeEntry) {
      sails.sockets.broadcast(`timesheet:${timeEntry.userId}`, 'timeEntryDelete', { item: timeEntry }, inputs.request);
    }

    return timeEntry;
  },
};
