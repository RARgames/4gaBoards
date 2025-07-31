const crypto = require('crypto');

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
  MAIL_ALREADY_EXISTS: {
    mailAlreadyExists: 'Mail already exists for this user and list',
  },
};

module.exports = {
  inputs: {
    listId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
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
    mailAlreadyExists: {
      responseType: 'conflict',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { list, board, project } = await sails.helpers.lists.getProjectPath(inputs.listId)
      .intercept('pathNotFound', () => Errors.MISSING_RELATIONS);

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.LIST_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const existing = await Mail.findOne({
      userId: currentUser.id,
      listId: list.id,
    });

    if (existing) {
      throw Errors.MAIL_ALREADY_EXISTS;
    }

    const mailId = crypto.randomBytes(8).toString('hex');

    const mail = await sails.helpers.mails.createOne.with({
      values: {
        mailId,
        userId: currentUser.id,
        listId: list.id,
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
