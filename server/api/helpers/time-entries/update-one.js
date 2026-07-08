module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    overlap: {},
  },

  async fn(inputs) {
    const { record, values, currentUser } = inputs;

    const nextStartedAt = values.startedAt || record.startedAt;
    const nextEndedAt = values.endedAt || record.endedAt;

    if (nextEndedAt <= nextStartedAt) {
      throw 'overlap'; // Reuse the same exit; controller reports it as a validation failure either way
    }

    const overlappingCount = await TimeEntry.count({
      id: { '!=': record.id },
      userId: record.userId,
      startedAt: { '<': nextEndedAt },
      endedAt: { '>': nextStartedAt },
    });

    if (overlappingCount > 0) {
      throw 'overlap';
    }

    const timeEntry = await TimeEntry.updateOne(record.id).set({
      ...values,
      updatedById: currentUser.id,
    });

    if (timeEntry) {
      sails.sockets.broadcast(`timesheet:${timeEntry.userId}`, 'timeEntryUpdate', { item: timeEntry }, inputs.request);
    }

    return timeEntry;
  },
};
