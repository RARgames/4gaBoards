const POSITION_GAP = 65536;

// Re-homes every archived card that still points at one column onto another, without
// un-archiving them: archivedAt and completedAt are left alone, so the cards keep their place
// in the Archive's month grouping and simply report a different source column.
//
// This is what makes an old Done column safe to delete once its cards have been archived —
// `card.list_id` has no foreign key, so deleting a column with archived cards behind it would
// otherwise strand them (see sails.helpers.cards.isArchived for how those are salvaged).
// fromListId may well name a column that has already been deleted, which is exactly that
// salvage path, so it is matched against card.listId rather than looked up as a list.

const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    fromListId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    toListId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    listNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.id);
    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden — hide existence, same as the other board actions
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const lists = await sails.helpers.boards.getLists(board.id);
    const listById = _.keyBy(lists, 'id');

    const toList = listById[inputs.toListId];
    if (!toList) {
      throw Errors.LIST_NOT_FOUND;
    }

    if (inputs.fromListId === inputs.toListId) {
      return {
        items: [],
      };
    }

    const boardCards = await sails.helpers.boards.getCards(board.id);
    const cards = _.sortBy(
      boardCards.filter((card) => `${card.listId}` === inputs.fromListId && sails.helpers.cards.isArchived(card, listById[card.listId])),
      'position',
    );

    if (cards.length === 0) {
      return {
        items: [],
      };
    }

    const toListCards = await sails.helpers.lists.getCards(toList.id);
    const basePosition = toListCards.reduce((max, card) => Math.max(max, card.position), 0);

    const items = [];
    // Sequential: each updateOne broadcasts and touches board meta, and the positions have to
    // stay in the order the cards already had.
    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];

      // eslint-disable-next-line no-await-in-loop
      const updatedCard = await sails.helpers.cards.updateOne.with({
        board,
        // updateOne drops values.list when it matches the card's current list, so an orphaned
        // card needs a stub standing in for the deleted one rather than the destination.
        list: listById[card.listId] || { id: card.listId, boardId: board.id },
        record: card,
        values: {
          list: toList,
          position: basePosition + (index + 1) * POSITION_GAP,
        },
        currentUser,
        request: this.req,
      });

      if (updatedCard) {
        items.push(updatedCard);
      }
    }

    return {
      items,
    };
  },
};
