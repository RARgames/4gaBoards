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
    const mailToken = await MailToken.findOne(inputs.criteria);

    if (!mailToken) {
      throw 'pathNotFound';
    }

    let path = {};

    if (mailToken.listId) {
      path = await sails.helpers.lists.getProjectPath(mailToken.listId).intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          mailToken,
          ...nodes,
        },
      }));
    } else if (mailToken.boardId) {
      path = await sails.helpers.boards.getProjectPath(mailToken.boardId).intercept('pathNotFound', (nodes) => ({
        pathNotFound: {
          mailToken,
          ...nodes,
        },
      }));
    } else {
      throw 'pathNotFound';
    }

    return {
      mailToken,
      ...path,
    };
  },
};
