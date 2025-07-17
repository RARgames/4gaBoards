module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { values, currentUser, skipMetaUpdate } = inputs;

    const action = await sails.helpers.actions.updateOne.with({ record: inputs.record, values, board: inputs.board, currentUser, skipMetaUpdate, request: inputs.request });

    if (action) {
      const commentUpdateAction = await Action.create({
        type: Action.Types.CARD_COMMENT_UPDATE,
        data: { prevText: inputs.record.data.text, text: values.data.text },
        cardId: action.cardId,
        userId: action.userId,
        createdById: currentUser.id,
      }).fetch();

      const card = await Card.findOne(action.cardId);
      if (card) {
        sails.sockets.broadcast(`board:${card.boardId}`, 'actionCreate', {
          item: commentUpdateAction,
        });
      }

      const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);

      await Promise.all(
        subscriptionUserIds.map(async (userId) =>
          sails.helpers.notifications.createOne.with({
            values: {
              userId,
              action: commentUpdateAction,
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
