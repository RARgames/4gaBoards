const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!(value.startedAt instanceof Date) || !(value.endedAt instanceof Date)) {
    return false;
  }

  if (value.endedAt <= value.startedAt) {
    return false;
  }

  if (!_.isString(value.userId) && !_.isFinite(value.userId)) {
    return false;
  }

  if (value.project != null && !_.isPlainObject(value.project)) {
    return false;
  }

  if (value.card != null && !_.isPlainObject(value.card)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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
    const { values, currentUser } = inputs;

    const overlappingCount = await TimeEntry.count({
      userId: values.userId,
      startedAt: { '<': values.endedAt },
      endedAt: { '>': values.startedAt },
    });

    if (overlappingCount > 0) {
      throw 'overlap';
    }

    const timeEntry = await TimeEntry.create({
      userId: values.userId,
      projectId: values.project ? values.project.id : null,
      cardId: values.card ? values.card.id : null,
      startedAt: values.startedAt,
      endedAt: values.endedAt,
      title: values.title || null,
      description: values.description || null,
      categoryTagId: values.categoryTagId || null,
      importedFrom: values.importedFrom || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    }).fetch();

    if (timeEntry) {
      sails.sockets.broadcast(`timesheet:${timeEntry.userId}`, 'timeEntryCreate', { item: timeEntry }, inputs.request);
    }

    return timeEntry;
  },
};
