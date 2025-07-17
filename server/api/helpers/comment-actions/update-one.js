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

    const action = await sails.helpers.actions.updateOne.with({ record: inputs.record, values, board: inputs.board, currentUser, skipMetaUpdate, request: inputs.request });

    if (action) {
      const card = await Card.findOne(action.cardId);
      if (card) {
        await sails.helpers.actions.createOne.with({
          values: {
            card,
            type: Action.Types.CARD_COMMENT_UPDATE,
            data: { id: action.id, prevText: inputs.record.data.text, text: action.data.text },
            user: currentUser,
          },
          currentUser,
        });
      }

      await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
    }

    return action;
  },
};
