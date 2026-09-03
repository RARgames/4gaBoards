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
    title: {
      type: 'string',
      allowNull: true,
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
    categoryTagId: {
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
    if (inputs.title !== undefined) {
      values.title = inputs.title;
    }
    if (inputs.description !== undefined) {
      values.description = inputs.description;
    }
    if (inputs.categoryTagId !== undefined) {
      values.categoryTagId = inputs.categoryTagId;
    }

    // The edit popup sends projectId/cardId on every save, even when only the times or the
    // description changed. Re-resolving an unchanged link re-checks the *editing* user's project
    // membership, which locks a member out of their own entry whenever it was logged for them
    // against a project they aren't a member of (an admin logging on their behalf, a team CSV
    // import, or a membership revoked after the fact). An unchanged link grants no new access, so
    // only a link the request actually changes needs validating.
    const nextProjectId = inputs.projectId === undefined ? record.projectId : inputs.projectId;
    const nextCardId = inputs.cardId === undefined ? record.cardId : inputs.cardId;
    const isLinkChanged = (nextProjectId || null) !== (record.projectId || null) || (nextCardId || null) !== (record.cardId || null);

    if (isLinkChanged) {
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
