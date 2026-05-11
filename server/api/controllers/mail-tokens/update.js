const Errors = {
  MISSING_RELATIONS: {
    missingRelations: 'Missing required related entities',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  BOARD_NOT_FOUND: {
    boardNotFound: 'Board not found',
  },
  MAIL_TOKEN_NOT_FOUND: {
    mailTokenNotFound: 'Mail token not found',
  },
};

module.exports = {
  inputs: {
    id: {
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
    boardNotFound: {
      responseType: 'notFound',
    },
    mailTokenNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let board = null;
    let mailToken;

    ({ board, mailToken } = await sails.helpers.mailTokens.getProjectPath(inputs.id).intercept('pathNotFound', () => Errors.MISSING_RELATIONS));

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

    if (!mailToken) {
      throw Errors.MAIL_TOKEN_NOT_FOUND;
    }
    if (mailToken.userId !== currentUser.id) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    mailToken = await sails.helpers.mailTokens.updateOne.with({
      values: {},
      record: mailToken,
      currentUser,
      request: this.req,
    });

    if (!mailToken) {
      throw Errors.MAIL_TOKEN_NOT_FOUND;
    }

    return {
      item: mailToken,
    };
  },
};
