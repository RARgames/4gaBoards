module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate } = inputs;

    const action = await sails.helpers.actions.deleteOne.with({ record: inputs.record, board: inputs.board, currentUser, skipMetaUpdate, request: inputs.request });

    if (action) {
      const card = await Card.findOne(action.cardId);
      if (card) {
        await sails.helpers.cards.updateOne.with({
          record: card,
          values: {
            commentCount: card.commentCount - 1,
          },
          currentUser,
        });

        const user = await User.findOne(action.userId);
        if (user) {
          await sails.helpers.actions.createOne.with({
            values: {
              card,
              type: Action.Types.CARD_COMMENT_DELETE,
              data: { id: action.id, userId: action.userId, text: action.data.text, userName: user.name },
              user: currentUser,
            },
            currentUser,
          });
        }
      }

      await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
    }

    return action;
  },
};
