const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  ENTRY_NOT_FOUND: {
    entryNotFound: 'Time entry not found',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
  ENTRY_OVERLAPS: {
    entryOverlaps: 'Entry overlaps an existing time entry',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    startedAt: {
      type: 'string',
    },
    endedAt: {
      type: 'string',
    },
    description: {
      type: 'string',
      allowNull: true,
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      allowNull: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    entryNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    entryOverlaps: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const record = await sails.helpers.timeEntries.getOne(inputs.id);

    if (!record) {
      throw Errors.ENTRY_NOT_FOUND;
    }

    if (record.userId !== currentUser.id && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = {};

    if (inputs.startedAt) {
      values.startedAt = new Date(inputs.startedAt);
    }
    if (inputs.endedAt) {
      values.endedAt = new Date(inputs.endedAt);
    }
    if (inputs.description !== undefined) {
      values.description = inputs.description;
    }

    if (inputs.projectId !== undefined || inputs.cardId !== undefined) {
      const { project, card } = await sails.helpers.timeEntries.resolveLink
        .with({
          projectId: inputs.projectId || undefined,
          cardId: inputs.cardId || undefined,
          currentUser,
        })
        .intercept('projectNotFound', () => Errors.PROJECT_NOT_FOUND)
        .intercept('cardNotFound', () => Errors.CARD_NOT_FOUND)
        .intercept('notEnoughRights', () => Errors.NOT_ENOUGH_RIGHTS);

      values.projectId = project ? project.id : null;
      values.cardId = card ? card.id : null;
    }

    const timeEntry = await sails.helpers.timeEntries.updateOne
      .with({
        record,
        values,
        currentUser,
        request: this.req,
      })
      .intercept('overlap', () => Errors.ENTRY_OVERLAPS);

    return {
      item: timeEntry,
    };
  },
};
