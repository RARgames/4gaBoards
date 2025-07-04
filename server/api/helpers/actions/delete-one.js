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
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { currentUser, skipMetaUpdate } = inputs;

    await Action.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
    const action = await Action.archiveOne(inputs.record.id);

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionDelete',
        {
          item: action,
        },
        inputs.request,
      );

      if (action.type === 'commentCard') {
        const card = await Card.findOne(action.cardId);
        if (card) {
          await sails.helpers.cards.updateOne.with({
            record: card,
            values: {
              commentCount: card.commentCount - 1,
            },
            currentUser,
            request: this.req,
          });
        }

        await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
      }
    }

    return action;
  },
};
