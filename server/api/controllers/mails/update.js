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
  MAIL_NOT_FOUND: {
    mailNotFound: 'Mail not found',
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
    mailNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    let list = null;
    let board;

    if (inputs.listId) {
      ({ list, board } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.LIST_NOT_FOUND));
    } else if (inputs.boardId) {
      ({ board } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.BOARD_NOT_FOUND));
    } else {
      throw Errors.LIST_NOT_FOUND;
    }

    const membership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!membership) {
      throw list ? Errors.LIST_NOT_FOUND : Errors.BOARD_NOT_FOUND;
    }

    if (membership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const updated = await sails.helpers.mails.updateOne.with({
      currentUser,
      listId: list ? list.id : null,
      boardId: board.id,
    });

    if (!updated) {
      throw Errors.MAIL_NOT_FOUND;
    }

    return { item: updated };
  },
};
