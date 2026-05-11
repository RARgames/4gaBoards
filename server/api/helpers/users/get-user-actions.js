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
      userId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.beforeId)) {
      criteria.id = {
        '<': inputs.beforeId,
      };
    }

    return sails.helpers.actions.getMany(criteria, sails.config.custom.actionsLimit);
  },
};
