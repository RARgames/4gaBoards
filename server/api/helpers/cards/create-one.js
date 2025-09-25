const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isUndefined(value.position) && !_.isFinite(value.position)) {
    return false;
  }

  if (!_.isPlainObject(value.list)) {
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
    duplicate: {
      type: 'boolean',
      defaultsTo: false,
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

  exits: {
    positionMustBeInValues: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate } = inputs;

    if (_.isUndefined(values.position)) {
      throw 'positionMustBeInValues';
    }

    const cards = await sails.helpers.lists.getCards(values.list.id);

    const { position, repositions } = sails.helpers.utils.insertToPositionables(values.position, cards);

    repositions.forEach(async ({ id, position: nextPosition }) => {
      await Card.update({
        id,
        listId: values.list.id,
      }).set({
        position: nextPosition,
      });

      sails.sockets.broadcast(`board:${values.list.boardId}`, 'cardUpdate', {
        item: {
          id,
          position: nextPosition,
        },
      });
    });

    const card = await Card.create({
      ...values,
      position,
      boardId: values.list.boardId,
      listId: values.list.id,
      createdById: currentUser.id,
    }).fetch();

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardCreate',
        {
          item: card,
        },
        inputs.request,
      );

      const userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: currentUser.id }, currentUser });
      if (userPrefs.subscribeToOwnCards) {
        await CardSubscription.create({
          cardId: card.id,
          userId: currentUser.id,
        }).tolerate('E_UNIQUE');

        sails.sockets.broadcast(`user:${currentUser.id}`, 'cardUpdate', {
          item: {
            id: card.id,
            isSubscribed: true,
          },
        });
      }

      await sails.helpers.actions.createOne.with({
        values: {
          card,
          scope: Action.Scopes.CARD,
          type: inputs.duplicate ? Action.Types.CARD_DUPLICATE : Action.Types.CARD_CREATE,
          data: {
            listId: values.list.id,
            listName: values.list.name,
          },
        },
        currentUser,
      });

      await sails.helpers.lists.updateMeta.with({ id: card.listId, currentUser, skipMetaUpdate });
    }

    return card;
  },
};
