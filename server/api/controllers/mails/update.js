const crypto = require('crypto');

const Errors = {
  MAIL_NOT_FOUND: {
    mailNotFound: 'Mail not found',
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
    mailNotFound: {
      responseType: 'notFound',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const mail = await Mail.findOne({
      userId: currentUser.id,
      listId: inputs.listId,
    });

    if (!mail) {
      throw Errors.MAIL_NOT_FOUND;
    }

    const newMailId = crypto.randomBytes(8).toString('hex');

    const updated = await Mail.updateOne({ id: mail.id }).set({
      mailId: newMailId,
    });

    return {
      item: updated,
    };
  },
};
