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
    skipNotifications: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

    const action = await Action.create({
      ...values,
      cardId: values.card.id,
      userId: values.user.id,
      createdById: currentUser.id,
    }).fetch();

    if (action) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'actionCreate',
        {
          item: action,
        },
        inputs.request,
      );

      if (!inputs.skipNotifications) {
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
      }
    }

    return action;
  },
};
