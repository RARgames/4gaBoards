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

    const mail = await Mail.findOne({ mailId: inputs.mailId });

    if (!mail) {
      throw Errors.MAIL_NOT_FOUND;
    }

    // if (mail.userId !== currentUser.id) {
    //   const isProjectManager = await sails.helpers.users.isProjectManager(currentUser.id, mail.projectId);
    //
    //   if (!isProjectManager) {
    //     throw Errors.MAIL_NOT_FOUND;
    //   }
    // }

    return {
      item: mail,
    };
  },
};
