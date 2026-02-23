module.exports = {
  inputs: {
    mailTokenId: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    pathNotFound: {},
  },

  async fn(inputs) {
    const mailToken = await MailToken.findOne({ id: inputs.mailTokenId });

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
      const board = await Board.findOne({ id: mailToken.boardId });
      if (!board) {
        throw 'pathNotFound';
      }
      path = { board, list: null };
    } else {
      throw 'pathNotFound';
    }

    return {
      mailToken,
      ...path,
    };
  },
};
