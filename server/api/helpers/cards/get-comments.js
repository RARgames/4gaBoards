const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    beforeId: {
      type: 'string',
    },
  },

  async fn(inputs) {
    const criteria = {
      cardId: inputs.idOrIds,
      deletedAt: null,
    };

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId,
      };
    }

    return sails.helpers.comments.getMany(criteria, sails.config.custom.commentsLimit);
  },
};
