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
        const commentActions = await sails.helpers.cards.getActions.with({ idOrIds: card.id, onlyComments: true });

        await sails.helpers.cards.updateOne.with({
          record: card,
          values: {
            commentCount: commentActions.length,
          },
          currentUser,
        });

        const user = await User.findOne(action.userId);
        if (user) {
          await sails.helpers.actions.createOne.with({
            values: {
              card,
              scope: Action.Scopes.CARD,
              type: Action.Types.CARD_COMMENT_DELETE,
              data: {
                commentActionId: action.id,
                userId: action.userId,
                commentActionText: action.data.text,
                userName: user.name,
              },
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
