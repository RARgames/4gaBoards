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

    let path = {};

    if (mail.listId) {
      path = await sails.helpers.lists.getProjectPath(mail.listId)
        .intercept('pathNotFound', (nodes) => ({
          pathNotFound: {
            mail,
            ...nodes,
          },
        }));
    } else if (mail.boardId) {
      const board = await Board.findOne({ id: mail.boardId });
      if (!board) {
        throw 'pathNotFound';
      }
      path = { board, list: null };
    } else {
      throw 'pathNotFound';
    }

    return {
      mail,
      ...path,
    };
  },
};
