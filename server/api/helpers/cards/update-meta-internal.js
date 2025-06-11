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

    const card = await Card.updateOne(id).set({ updatedAt: new Date().toUTCString(), updatedById: currentUser.id });
    if (card) {
      sails.sockets.broadcast(`board:${card.boardId}`, 'cardUpdate', {
        item: {
          id: card.id,
          updatedAt: card.updatedAt,
          updatedById: card.updatedById,
        },
      });

      await sails.helpers.lists.updateMeta.with({ id: card.listId, currentUser });
    }

    return card;
  },
};
