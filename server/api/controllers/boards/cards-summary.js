// Lightweight cards + lists summary for a board, used by the cross-board card-link picker
// (which lets a user narrow project -> board -> column -> ticket). Gated on the requester
// being a member of that board.

const Errors = {
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
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
    boardNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const board = await Board.findOne(inputs.id);
    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    // Membership-gated: non-members shouldn't be able to enumerate a board's cards.
    // Hide existence with notFound rather than forbidden.
    const boardMembership = await BoardMembership.findOne({ boardId: board.id, userId: currentUser.id });
    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const [cards, lists] = await Promise.all([Card.find({ boardId: board.id }).select(['id', 'name', 'listId']).sort('position'), List.find({ boardId: board.id }).select(['id', 'name']).sort('position')]);

    return {
      items: cards.map((card) => ({ id: card.id, name: card.name, listId: card.listId })),
      lists: lists.map((list) => ({ id: list.id, name: list.name })),
    };
  },
};
