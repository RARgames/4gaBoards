const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
};

module.exports = {
  inputs: {
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
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
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const board = await Board.findOne({ id: inputs.boardId });
    if (!board) {
      throw Errors.BOARD_NOT_FOUND;
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const user = await User.findOne({
      username: inputs.name,
    });

    if (!user) {
      return { item: { userId: null } };
    }

    const isBoardMember = await sails.helpers.users.isBoardMember(user.id, board.id);

    if (!isBoardMember) {
      return { item: { userId: null } };
    }

    return {
      item: {
        userId: user.id,
      },
    };
  },
};
