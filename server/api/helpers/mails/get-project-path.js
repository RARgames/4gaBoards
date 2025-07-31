module.exports = {
  inputs: {
    criteria: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const mail = await Mail.findOne(inputs.criteria);

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
