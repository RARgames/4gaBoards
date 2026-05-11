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

    // FUTURE check for name without case sensitivity - improve
    const rawResult = await sails.sendNativeQuery(
      `SELECT id FROM label
       WHERE "board_id" = $1
       AND LOWER("name") = LOWER($2)
       LIMIT 1`,
      [board.id, inputs.name],
    );
    const label = rawResult.rows[0] || null;

    if (!label) {
      return {
        item: {
          labelId: null,
        },
      };
    }

    return {
      item: {
        labelId: label.id,
      },
    };
  },
};
