const Errors = {
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, project } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, card.boardId);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.CARD_NOT_FOUND; // Forbidden
      }
    }

    const timeEntries = await sails.helpers.timeEntries.getMany({ cardId: card.id });

    const totalMinutes = timeEntries.reduce((sum, timeEntry) => sum + Math.round((new Date(timeEntry.endedAt).getTime() - new Date(timeEntry.startedAt).getTime()) / 60000), 0);

    return {
      totalMinutes,
    };
  },
};
