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

      let card = await Card.findOne(task.cardId);
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

    return task;
  },
};
