const Errors = {
  MISSING_RELATIONS: {
    missingRelations: 'Missing required related entities',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  LIST_NOT_FOUND: {
    listNotFound: 'List not found',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  MAIL_TOKEN_ALREADY_EXISTS: {
    mailTokenAlreadyExists: 'Mail token already exists for this user',
  },
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
    boardId: {
      type: 'string',
      regex: /^[0-9]+$/,
    },
  },

  exits: {
    missingRelations: {
      responseType: 'badRequest',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
    listNotFound: {
      responseType: 'notFound',
    },
    boardNotFound: {
      responseType: 'notFound',
    },
    mailTokenAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let board;

    if (inputs.listId) {
      ({ list, board } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS));
    } else if (inputs.boardId) {
      ({ board } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS));
    } else {
      throw Errors.MISSING_RELATIONS;
    }

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

    const mailToken = await sails.helpers.mailTokens.createOne.with({
      values: {
        list: inputs.listId ? list : undefined,
        board: inputs.boardId ? board : undefined,
      },
      currentUser,
      request: this.req,
    });

    return {
      item: mailToken,
    };
  },
};
