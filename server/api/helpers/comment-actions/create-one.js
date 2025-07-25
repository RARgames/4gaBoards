const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.card)) {
    return false;
  }

  if (!_.isPlainObject(value.user)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
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

    const action = await sails.helpers.actions.createOne.with({ values, currentUser, skipNotifications: true, request: inputs.request });

    if (action) {
      if (!values.duplicate) {
        await sails.helpers.cards.updateOne.with({
          record: values.card,
          values: {
            commentCount: values.card.commentCount + 1,
          },
          currentUser,
        });
      }

      await sails.helpers.actions.createOne.with({
        values: {
          card: values.card,
          type: Action.Types.CARD_COMMENT_CREATE,
          data: { id: action.id, text: action.data.text },
          user: currentUser,
        },
        currentUser,
      });

      await sails.helpers.cards.updateMeta.with({ id: action.cardId, currentUser, skipMetaUpdate });
    }

    return action;
  },
};
