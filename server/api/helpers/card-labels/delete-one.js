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
    skipActions: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate, skipActions } = inputs;

    const cardLabel = await CardLabel.destroyOne(inputs.record.id);

    if (cardLabel) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'cardLabelDelete',
        {
          item: cardLabel,
        },
        inputs.request,
      );

      if (!skipActions) {
        const card = await Card.findOne(inputs.record.cardId);
        const label = await Label.findOne(cardLabel.labelId);
        if (card && label) {
          await sails.helpers.actions.createOne.with({
            values: {
              card,
              scope: Action.Scopes.CARD,
              type: Action.Types.CARD_LABEL_REMOVE,
              data: {
                cardLabelId: cardLabel.id,
                labelId: cardLabel.labelId,
                labelName: label.name,
              },
            },
            currentUser,
          });
        }
      }

      await sails.helpers.cards.updateMeta.with({ id: cardLabel.cardId, currentUser, skipMetaUpdate });
    }

    return cardLabel;
  },
};
