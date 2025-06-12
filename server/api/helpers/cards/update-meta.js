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
    skipMetaUpdate: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const { id, currentUser, skipMetaUpdate } = inputs;
    if (skipMetaUpdate) {
      return undefined;
    }

    sails.helpers.cards.updateMetaInternal.with({ id, currentUser }).catch((err) => {
      sails.log.error('cards.updateMetaInternal failed:', err);
    });

    return undefined;
  },
};
