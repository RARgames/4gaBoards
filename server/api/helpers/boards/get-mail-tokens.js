const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptMailTokenIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      boardId: inputs.idOrIds,
    };

    if (!_.isUndefined(inputs.exceptMailTokenIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptMailTokenIdOrIds,
      };
    }

    return MailToken.find(criteria);
  },
};
