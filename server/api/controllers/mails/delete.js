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
  MAIL_NOT_FOUND: {
    mailNotFound: 'Mail not found',
  },
};

module.exports = {
  inputs: {
    mailId: {
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
    mailNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const mail = await Mail.findOne({ mailId: inputs.mailId });
    if (!mail) {
      throw Errors.MAIL_NOT_FOUND;
    }

    const { board } = await sails.helpers.boards.getProjectPath(mail.boardId).intercept('pathNotFound', () => Errors.MISSING_RELATIONS);

    const project = await Project.findOne({ id: board.projectId });
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const isOwner = mail.userId === currentUser.id;

    if (!isOwner && !isProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    const deleted = await sails.helpers.mails.deleteOne.with({
      record: mail,
      request: this.req,
    });

    return {
      item: deleted,
    };
  },
};
