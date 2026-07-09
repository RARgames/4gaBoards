const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
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
    userId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    startedAt: {
      type: 'string',
      required: true,
    },
    endedAt: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
    },
    projectId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    categoryTagId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
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

    if (inputs.userId && inputs.userId !== currentUser.id && !currentUser.isAdmin) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const targetUserId = inputs.userId && currentUser.isAdmin ? inputs.userId : currentUser.id;

    const { project, card } = await sails.helpers.timeEntries.resolveLink
      .with({
        projectId: inputs.projectId,
        cardId: inputs.cardId,
        currentUser,
      })
      .intercept('projectNotFound', () => Errors.PROJECT_NOT_FOUND)
      .intercept('cardNotFound', () => Errors.CARD_NOT_FOUND)
      .intercept('notEnoughRights', () => Errors.NOT_ENOUGH_RIGHTS);

    const timeEntry = await sails.helpers.timeEntries.createOne
      .with({
        values: {
          userId: targetUserId,
          startedAt: new Date(inputs.startedAt),
          endedAt: new Date(inputs.endedAt),
          description: inputs.description,
          categoryTagId: inputs.categoryTagId,
          project,
          card,
        },
        currentUser,
        request: this.req,
      })
      .intercept('overlap', () => Errors.ENTRY_OVERLAPS);

    return {
      item: timeEntry,
    };
  },
};
