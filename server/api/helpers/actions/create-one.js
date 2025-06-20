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

    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
      createdById: currentUser.id,
    }).fetch();

    if (action) {
      if (values.type === 'commentCard' && !values.duplicate) {
        await sails.helpers.cards.updateOne.with({
          record: values.card,
          values: {
            commentCount: values.card.commentCount + 1,
          },
          currentUser,
          request: this.req,
        });
      }

      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'actionCreate',
        {
          item: action,
        },
        inputs.request,
      );

      const subscriptionUserIds = await sails.helpers.cards.getSubscriptionUserIds(action.cardId, action.userId);

      await Promise.all(
        subscriptionUserIds.map(async (userId) =>
          sails.helpers.notifications.createOne.with({
            values: {
              userId,
              action,
            },
            currentUser,
          }),
        ),
      );

      if (action.type === 'commentCard') {
        await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
      }
    }

    return action;
  },
};
