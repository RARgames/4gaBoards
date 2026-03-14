const Errors = {
  MAIL_TOKEN_NOT_FOUND: {
    mailTokenNotFound: 'Mail token not found',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  MISSING_RELATIONS: {
    missingRelations: 'Missing required related entities',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
};

module.exports = {
  inputs: {
    token: {
      type: 'string',
      regex: /^[a-f0-9]+$/,
      required: true,
    },
  },

  exits: {
    mailTokenNotFound: {
      responseType: 'notFound',
    },
    projectNotFound: {
      responseType: 'notFound',
    },
    missingRelations: {
      responseType: 'badRequest',
    },
    notEnoughRights: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const mailToken = await MailToken.findOne({ token: inputs.token });
    if (!mailToken) {
      throw Errors.MAIL_TOKEN_NOT_FOUND;
    }

    const { project, board, list } = await sails.helpers.mailTokens.getProjectPath(mailToken.id).intercept('pathNotFound', () => Errors.MISSING_RELATIONS);
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);
    const isOwner = mailToken.userId === currentUser.id;

    if (!isOwner && !isProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const boardMembership = await BoardMembership.findOne({
      boardId: board.id,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    if (list) {
      return {
        item: {
          listId: list.id,
        },
      };
    }

    const lists = await sails.helpers.boards.getLists(board.id);

    return {
      item: {
        listId: lists[0] ? lists[0]?.id : null,
      },
    };
  },
};
