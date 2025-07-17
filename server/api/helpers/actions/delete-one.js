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
    const { currentUser } = inputs;

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
    }

    return action;
  },
};
