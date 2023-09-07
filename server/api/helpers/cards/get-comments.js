const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
  },

  async fn(inputs) {
    return sails.helpers.actions.getMany({
      cardId: inputs.idOrIds,
      type: Action.Types.COMMENT_CARD,
    });
  },
};
