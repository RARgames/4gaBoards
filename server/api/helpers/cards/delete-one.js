module.exports = {
  inputs: {
    record: {
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

    const card = await Card.archiveOne(inputs.record.id);

    if (card) {
      sails.sockets.broadcast(
        `board:${card.boardId}`,
        'cardDelete',
        {
          item: card,
        },
        inputs.request,
      );

      let list = await List.findOne(card.listId);
      if (list) {
        list = await List.updateOne(list.id).set({ updatedById: currentUser.id });
        if (list) {
          sails.sockets.broadcast(`board:${list.boardId}`, 'listUpdate', {
            item: {
              id: list.id,
              updatedAt: list.updatedAt,
              updatedById: list.updatedById,
            },
          });
        }
      }
    }

    return card;
  },
};
