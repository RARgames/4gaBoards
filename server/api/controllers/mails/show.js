const Errors = {
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
    mailNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const { mail, board, project } = await sails.helpers.mails.getProjectPath(inputs.mailId)
      .intercept('pathNotFound', () => Errors.MAIL_NOT_FOUND);

    const isBoardMember = await sails.helpers.users.isBoardMember(currentUser.id, board.id);

    if (!isBoardMember) {
      const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, project.id);

      if (!isProjectManager) {
        throw Errors.MAIL_NOT_FOUND; // Forbidden
      }
    }

    return {
      item: mail,
    };
  },
};
