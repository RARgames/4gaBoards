const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const userSubscriptions = await sails.helpers.userPrefs.getUserSubscriptions.with({ exceptUserIdOrIds: inputs.exceptUserIdOrIds });

    return sails.helpers.utils.mapRecords(userSubscriptions, 'id');
  },
};
