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
    position: {
      type: 'number',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    isCollapsed: {
      type: 'boolean',
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

    const { board } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.BOARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const values = _.pick(inputs, ['position', 'name', 'isCollapsed']);

    const list = await sails.helpers.lists.createOne.with({
      values: {
        ...values,
        board,
      },
      currentUser,
      request: this.req,
    });

    return {
      item: list,
    };
  },
};
