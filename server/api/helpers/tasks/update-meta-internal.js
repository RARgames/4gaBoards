const idValidator = (value) => _.isString(value);

module.exports = {
  inputs: {
    id: {
      type: 'json',
      custom: idValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { id, currentUser } = inputs;

    const task = await Task.updateOne(id).set({ updatedAt: new Date().toUTCString(), updatedById: currentUser.id });
    if (task) {
      const card = await Card.findOne(task.cardId);
      if (card) {
        sails.sockets.broadcast(`board:${card.boardId}`, 'taskUpdate', {
          item: {
            id: task.id,
            updatedAt: task.updatedAt,
            updatedById: task.updatedById,
          },
        });

        await sails.helpers.cards.updateMeta.with({ id: card.id, currentUser });
      }
    }

    return task;
  },
};
