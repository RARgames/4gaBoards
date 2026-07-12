// §5.4 / §7 Decision 2: "Restore" (card-detail-modal button). Always clears archivedAt AND
// completedAt — the latter is required, not cosmetic: if the card stayed in a `done`-type list
// with its old completedAt intact, sails.helpers.cards.isArchived would reclassify it as
// archived again on the very next board fetch (completedAt + autoArchiveDays is still elapsed).
// Restoring means "back to normal, undone" regardless of where it lands.
//
// If the board has an `active`-type list, the card is moved there (appended to the end),
// matching the spec's recommendation. Otherwise the card stays in its current list — un-done,
// but not relocated — for the user to drag manually.

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

    const lists = await sails.helpers.boards.getLists(board.id);
    const targetList = lists.find((candidate) => candidate.type === 'active');

    const values = {
      archivedAt: null,
      completedAt: null,
    };

    if (targetList && targetList.id !== list.id) {
      const targetListCards = await sails.helpers.lists.getCards(targetList.id);
      const maxPosition = targetListCards.reduce((max, targetCard) => Math.max(max, targetCard.position), 0);

      values.list = targetList;
      values.position = maxPosition + 65536;
    }

    const updatedCard = await sails.helpers.cards.updateOne.with({
      board,
      list,
      record: card,
      values,
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
