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

    await Card.updateOne(inputs.record.id).set({ updatedById: currentUser.id });
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

      const list = await List.findOne(card.listId);
      if (list) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            scope: Action.Scopes.CARD,
            type: Action.Types.CARD_DELETE,
            data: {
              listId: card.listId,
              listName: list.name,
            },
          },
          currentUser,
        });
      }

      await sails.helpers.lists.updateMeta.with({ id: card.listId, currentUser, skipMetaUpdate });
    }

    return card;
  },
};
