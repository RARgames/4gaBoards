const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const criteria = {
      subscribeToUsers: true,
    };

    if (!_.isUndefined(inputs.exceptUserIdOrIds)) {
      criteria.id = {
        '!=': inputs.exceptUserIdOrIds,
      };
    }

    return sails.helpers.userPrefs.getMany(criteria);
  },
};
