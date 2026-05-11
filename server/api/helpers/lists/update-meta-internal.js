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

    const list = await List.updateOne(id).set({ updatedAt: new Date().toUTCString(), updatedById: currentUser.id });
    if (list) {
      sails.sockets.broadcast(`board:${list.boardId}`, 'listUpdate', {
        item: {
          id: list.id,
          updatedAt: list.updatedAt,
          updatedById: list.updatedById,
        },
      });

      await sails.helpers.boards.updateMeta.with({ id: list.boardId, currentUser });
    }

    return list;
  },
};
