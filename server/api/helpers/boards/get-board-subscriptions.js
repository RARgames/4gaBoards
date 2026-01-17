const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    idOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
      required: true,
    },
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      boardId: inputs.idOrIds,
      isSubscribed: true,
    };

    if (!_.isUndefined(inputs.exceptUserIdOrIds)) {
      criteria.userId = {
        '!=': inputs.exceptUserIdOrIds,
      };
    }

    return sails.helpers.boardMemberships.getMany(criteria);
  },
};
