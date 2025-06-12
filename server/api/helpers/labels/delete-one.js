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

    const removedCardLabels = await CardLabel.destroy({
      labelId: inputs.record.id,
    }).fetch();

    const affectedCardIds = sails.helpers.utils.mapRecords(removedCardLabels, 'cardId');
    const cards = await Card.find({ id: affectedCardIds });

    await Promise.all(
      cards.map(async (card) => {
        await sails.helpers.cards.updateMeta.with({ id: card.id, currentUser, skipMetaUpdate });
      }),
    );

    const label = await Label.archiveOne(inputs.record.id);

    if (label) {
      sails.sockets.broadcast(
        `board:${label.boardId}`,
        'labelDelete',
        {
          item: label,
        },
        inputs.request,
      );

      await sails.helpers.boards.updateMeta.with({ id: label.boardId, currentUser, skipMetaUpdate });
    }

    return label;
  },
};
