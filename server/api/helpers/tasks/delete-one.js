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

    await Task.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
    const task = await Task.archiveOne(inputs.record.id);

    if (task) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'taskDelete',
        {
          item: task,
        },
        inputs.request,
      );

      const card = await Card.findOne(task.cardId);
      if (card) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            scope: Action.Scopes.CARD,
            type: Action.Types.CARD_TASK_DELETE,
            data: {
              taskId: task.id,
              taskName: task.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: task.cardId, currentUser, skipMetaUpdate });
    }

    return task;
  },
};
