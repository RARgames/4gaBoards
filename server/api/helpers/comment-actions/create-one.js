const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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

    const action = await sails.helpers.actions.createOne.with({ values, currentUser, skipMetaUpdate, skipNotifications: true, request: inputs.request });

    if (action) {
      if (!values.duplicate) {
        await sails.helpers.cards.updateOne.with({
          record: values.card,
          values: {
            commentCount: values.card.commentCount + 1,
          },
          currentUser,
        });
      }

      const commentCreateAction = await Action.create({
        type: Action.Types.CARD_COMMENT_CREATE,
        data: values.data,
        cardId: values.card.id,
        userId: values.user.id,
        createdById: currentUser.id,
      }).fetch();

      sails.sockets.broadcast(`board:${values.card.boardId}`, 'actionCreate', {
        item: commentCreateAction,
      });

      const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);

      await Promise.all(
        subscriptionUserIds.map(async (userId) =>
          sails.helpers.notifications.createOne.with({
            values: {
              userId,
              action: commentCreateAction,
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
