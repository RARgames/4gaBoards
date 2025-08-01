module.exports = {
  inputs: {
    mailId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const mail = await Mail.findOne({ mailId: inputs.mailId });

    if (!mail) {
      throw 'pathNotFound';
    }

    const path = await sails.helpers.lists.getProjectPath(mail.listId).intercept('pathNotFound', (nodes) => ({
      pathNotFound: {
        mail,
        ...nodes,
      },
    }));

    return {
      mail,
      ...path,
    };
  },
};
