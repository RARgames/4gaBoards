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
      }

      const commentDeleteAction = await Action.create({
        type: Action.Types.CARD_COMMENT_DELETE,
        data: action.data,
        cardId: action.cardId,
        userId: action.userId,
        createdById: currentUser.id,
      }).fetch();

      sails.sockets.broadcast(`board:${card.boardId}`, 'actionCreate', {
        item: commentDeleteAction,
      });

      const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);

      await Promise.all(
        subscriptionUserIds.map(async (userId) =>
          sails.helpers.notifications.createOne.with({
            values: {
              userId,
              action: commentDeleteAction,
            },
            currentUser,
          }),
        ),
      );

      await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
    }

    return action;
  },
};
