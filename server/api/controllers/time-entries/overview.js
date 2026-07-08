const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    from: {
      type: 'string',
      required: true,
    },
    to: {
      type: 'string',
      required: true,
    },
    timezone: {
      type: 'string',
      defaultsTo: 'UTC',
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    if (!currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const timeEntries = await sails.helpers.timeEntries.getMany({
      startedAt: { '<': new Date(inputs.to) },
      endedAt: { '>': new Date(inputs.from) },
    });

    const byUserId = new Map();

    timeEntries.forEach((timeEntry) => {
      const startedAt = new Date(timeEntry.startedAt);
      const endedAt = new Date(timeEntry.endedAt);
      const dayKey = startedAt.toLocaleDateString('en-CA', { timeZone: inputs.timezone });
      const minutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

      if (!byUserId.has(timeEntry.userId)) {
        byUserId.set(timeEntry.userId, { userId: timeEntry.userId, totalMinutes: 0, entriesCount: 0, days: {} });
      }

      const entry = byUserId.get(timeEntry.userId);
      entry.totalMinutes += minutes;
      entry.entriesCount += 1;
      entry.days[dayKey] = (entry.days[dayKey] || 0) + minutes;
    });

    return {
      items: Array.from(byUserId.values()),
    };
  },
};
