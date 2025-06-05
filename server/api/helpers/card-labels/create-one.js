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
    request: {
      type: 'ref',
    },
  },

  exits: {
    labelAlreadyInCard: {},
  },

  async fn(inputs) {
    const { values, currentUser } = inputs;

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

      await sails.helpers.cards.updateMeta.with({ id: cardLabel.cardId, currentUser });
    }

    return cardLabel;
  },
};
