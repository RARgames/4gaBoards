// §5.4 / §7 Decision 2: "Restore" (card-detail-modal button). Always clears archivedAt.
//
// If the board has an `active`-type list, the card is moved there (appended to the end),
// matching the spec's recommendation. Otherwise the card stays in its current list — un-done,
// but not relocated — for the user to drag manually.
//
// completedAt is preserved when the card lands outside a `done`-type list, so a restored card
// keeps the date it was actually completed (the Archive groups by it). It has to be cleared
// when the card stays in a done list, though: sails.helpers.cards.isArchived would otherwise
// reclassify it as archived on the very next board fetch, since completedAt + autoArchiveDays
// is still elapsed.

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
    };

    if (targetList && targetList.id !== list.id) {
      const targetListCards = await sails.helpers.lists.getCards(targetList.id);
      const maxPosition = targetListCards.reduce((max, targetCard) => Math.max(max, targetCard.position), 0);

      values.list = targetList;
      values.position = maxPosition + 65536;
    }

    const finalList = values.list || list;
    if (finalList.type === 'done') {
      values.completedAt = null;
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
