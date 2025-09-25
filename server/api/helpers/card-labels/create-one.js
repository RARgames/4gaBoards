const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.label)) {
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
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  exits: {
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values, currentUser, skipMetaUpdate, skipActions } = inputs;

    const cardLabel = await CardLabel.create({
      ...values,
      cardId: values.card.id,
      labelId: values.label.id,
      createdById: currentUser.id,
    })
      .intercept('E_UNIQUE', 'labelAlreadyInCard')
      .fetch();

    if (cardLabel) {
      sails.sockets.broadcast(
        `board:${values.card.boardId}`,
        'cardLabelCreate',
        {
          item: cardLabel,
        },
        inputs.request,
      );

      if (!skipActions) {
        await sails.helpers.actions.createOne.with({
          values: {
            card: values.card,
            scope: Action.Scopes.CARD,
            type: Action.Types.CARD_LABEL_ADD,
            data: {
              cardLabelId: cardLabel.id,
              labelId: cardLabel.labelId,
              labelName: values.label.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: cardLabel.cardId, currentUser, skipMetaUpdate });
    }

    return cardLabel;
  },
};
