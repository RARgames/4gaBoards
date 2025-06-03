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

    const action = await Action.archiveOne(inputs.record.id);

    if (action.type === 'commentCard') {
      const cards = await sails.helpers.cards.getMany({ id: action.cardId });
      if (cards.length > 0) {
        const card = cards[0];
        await sails.helpers.cards.updateOne.with({
          record: card,
          values: {
            commentCount: card.commentCount - 1,
          },
          currentUser,
          request: this.req,
        });
      }
    }

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionDelete',
        {
          item: action,
        },
        inputs.request,
      );
    }

    return action;
  },
};
