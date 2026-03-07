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
    id: {
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
    projectNotFound: {
      responseType: 'notFound',
    },
    mailTokenNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    let mailToken = await MailToken.findOne({ id: inputs.id });
    if (!mailToken) {
      throw Errors.MAIL_TOKEN_NOT_FOUND;
    }

    const { project } = await sails.helpers.mailTokens.getProjectPath(mailToken.id).intercept('pathNotFound', () => Errors.MISSING_RELATIONS);
    if (!project) {
      throw Errors.PROJECT_NOT_FOUND;
    }

    const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

    const isOwner = mailToken.userId === currentUser.id;

    if (!isOwner && !isProjectManager) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    mailToken = await sails.helpers.mailTokens.deleteOne.with({
      record: mailToken,
      currentUser,
      request: this.req,
    });

    return {
      item: mailToken,
    };
  },
};
