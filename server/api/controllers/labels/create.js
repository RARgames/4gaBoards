const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  INVALID_NAME: {
    invalidName: 'Invalid name',
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
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: Label.COLORS,
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
    invalidName: {
      responseType: 'forbidden',
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

    const values = _.pick(inputs, ['name', 'color']);

    const label = await sails.helpers.labels.createOne
      .with({
        values: {
          ...values,
          board,
        },
        request: this.req,
      })
      .intercept('invalidName', () => Errors.INVALID_NAME);

    return {
      item: label,
    };
  },
};
