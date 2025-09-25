const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user) && !_.isString(value.userId)) {
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
    duplicate: {
      type: 'boolean',
      defaultsTo: false,
    },
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    userAlreadyCardMember: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

    if (values.user) {
      values.userId = values.user.id;
    }

    const cardMembership = await CardMembership.create({
      ...values,
      cardId: values.card.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'userAlreadyCardMember')
      .fetch();

    if (cardMembership) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'cardMembershipCreate',
        {
          item: cardMembership,
        },
        inputs.request,
      );

      const existingSubscription = await CardSubscription.findOne({
        cardId: cardMembership.cardId,
        userId: cardMembership.userId,
      });

      if (!existingSubscription) {
        const cardSubscription = await CardSubscription.create({
          cardId: cardMembership.cardId,
          userId: cardMembership.userId,
          isPermanent: false,
        })
          .tolerate('E_UNIQUE')
          .fetch();

        if (cardSubscription) {
          sails.sockets.broadcast(
            `user:${cardMembership.userId}`,
            'cardUpdate',
            {
              item: {
                id: cardMembership.cardId,
                isSubscribed: true,
              },
            },
            inputs.duplicate ? undefined : inputs.request,
          );
        }
      }

      if (!skipActions) {
        const user = await User.findOne(cardMembership.userId);
        if (user) {
          await sails.helpers.actions.createOne.with({
            values: {
              card: values.card,
              scope: Action.Scopes.CARD,
              type: Action.Types.CARD_USER_ADD,
              data: {
                cardMembershipId: cardMembership.id,
                userId: cardMembership.userId,
                userName: user.name,
              },
            },
            currentUser,
          });
        }
      }

      await sails.helpers.cards.updateMeta.with({ id: cardMembership.cardId, currentUser, skipMetaUpdate });
    }

    return cardMembership;
  },
};
