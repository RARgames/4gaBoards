// §5.4: manual "Archive now" (card-detail-modal button). Sets archivedAt; leaves listId and
// completedAt untouched — the card just starts matching sails.helpers.cards.isArchived
// immediately instead of waiting out its list's autoArchiveDays.

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
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
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { card, list, board } = await sails.helpers.cards.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const updatedCard = await sails.helpers.cards.updateOne.with({
      board,
      list,
      record: card,
      values: {
        archivedAt: new Date(),
      },
      currentUser,
      request: this.req,
    });

    if (!updatedCard) {
      throw Errors.CARD_NOT_FOUND;
    }

    return {
      item: updatedCard,
    };
  },
};
