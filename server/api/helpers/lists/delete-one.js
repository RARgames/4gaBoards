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

    await List.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
    const list = await List.archiveOne(inputs.record.id);

    if (list) {
      sails.sockets.broadcast(
        `board:${list.boardId}`,
        'listDelete',
        {
          item: list,
        },
        inputs.request,
      );

      await sails.helpers.actions.createOne.with({
        values: {
          list,
          scope: Action.Scopes.LIST,
          type: Action.Types.LIST_DELETE,
          data: {
            listId: list.id,
            listName: list.name,
          },
        },
        currentUser,
      });

      await sails.helpers.boards.updateMeta.with({ id: list.boardId, currentUser, skipMetaUpdate });
    }

    return list;
  },
};
