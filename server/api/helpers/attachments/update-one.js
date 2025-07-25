module.exports = {
  inputs: {
    record: {
      type: 'ref',
      required: true,
    },
    values: {
      type: 'json',
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
    const { values, currentUser, skipMetaUpdate } = inputs;

    const attachment = await Attachment.updateOne(inputs.record.id).set({ updatedById: currentUser.id, ...values });

    if (attachment) {
      sails.sockets.broadcast(
        `board:${inputs.board.id}`,
        'attachmentUpdate',
        {
          item: attachment,
        },
        inputs.request,
      );

      const card = await Card.findOne(attachment.cardId);
      if (card) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            type: Action.Types.CARD_ATTACHMENT_UPDATE,
            data: {
              id: attachment.id,
              prevName: inputs.record.name,
              name: attachment.name,
            },
            user: currentUser,
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: attachment.cardId, currentUser, skipMetaUpdate });
    }

    return attachment;
  },
};
