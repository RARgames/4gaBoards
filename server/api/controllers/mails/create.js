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
  MAIL_ALREADY_EXISTS: {
    mailAlreadyExists: 'Mail ID already exists for this user',
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
    mailAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let list = null;
    let board;
    let project;

    if (inputs.listId) {
      ({ list, board, project } = await sails.helpers.lists.getProjectPath(inputs.listId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS));
    } else if (inputs.boardId) {
      ({ board, project } = await sails.helpers.boards.getProjectPath(inputs.boardId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS));
    } else {
      throw Errors.MISSING_RELATIONS;
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw list ? Errors.LIST_NOT_FOUND : Errors.BOARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const criteria = { userId: currentUser.id };
    if (list) {
      criteria.listId = list.id;
    } else {
      criteria.boardId = board.id;
      criteria.listId = null;
    }

    const existing = await Mail.findOne(criteria);
    if (existing) {
      throw Errors.MAIL_ALREADY_EXISTS;
    }

    const mail = await sails.helpers.mails.createOne.with({
      values: {
        userId: currentUser.id,
        listId: list ? list.id : null,
        boardId: board.id,
        projectId: project.id,
      },
      request: this.req,
    });

    return {
      item: mail,
    };
  },
};
