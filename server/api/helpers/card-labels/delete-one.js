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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser } = inputs;

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

      let card = await Card.findOne(cardLabel.cardId);
      if (card) {
        card = await Card.updateOne(card.id).set({ updatedById: currentUser.id });
        if (card) {
          sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
            item: {
              id: card.id,
              updatedAt: card.updatedAt,
              updatedById: card.updatedById,
            },
          });
        }
      }
    }

    return cardLabel;
  },
};
