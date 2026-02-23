const Errors = {
  MISSING_RELATIONS: {
    missingRelations: 'Missing required related entities',
  },
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  PROJECT_NOT_FOUND: {
    projectNotFound: 'Project not found',
  },
  MAIL_TOKEN_NOT_FOUND: {
    mailTokenNotFound: 'Mail token not found',
  },
};

module.exports = {
  inputs: {
    mailTokenId: {
      type: 'string',
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
    projectNotFound: {
      responseType: 'notFound',
    },
    mailTokenNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const mailToken = await MailToken.findOne({ id: inputs.mailTokenId });
    if (!mailToken) {
      throw Errors.MAIL_TOKEN_NOT_FOUND;
    }

    const { board } = await sails.helpers.boards.getProjectPath(mailToken.boardId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS);

    const project = await Project.findOne({ id: board.projectId });
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const isOwner = mailToken.userId === currentUser.id;

    if (!isOwner && !isProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const deleted = await sails.helpers.mailTokens.deleteOne.with({
      record: mailToken,
      request: this.req,
    });

    return {
      item: deleted,
    };
  },
};
