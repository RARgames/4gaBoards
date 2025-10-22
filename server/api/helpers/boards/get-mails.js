const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptMailIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      boardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptMailIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptMailIdOrIds,
      };
    }

    return Mail.find(criteria);
  },
};
