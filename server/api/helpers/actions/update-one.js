module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { values, currentUser, skipMetaUpdate } = inputs;

    const action = await Action.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (action) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'actionUpdate',
        {
          item: action,
        },
        inputs.request,
      );

      if (action.type === 'commentCard') {
        await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
      }
    }

    return action;
  },
};
