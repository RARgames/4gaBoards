const idOrIdsValidator = (value) => _.isString(value) || _.every(value, _.isString);

module.exports = {
  inputs: {
    exceptUserIdOrIds: {
      type: 'json',
      custom: idOrIdsValidator,
    },
  },

  async fn(inputs) {
    const instanceSubscriptions = await sails.helpers.userPrefs.getInstanceSubscriptions.with({ exceptUserIdOrIds: inputs.exceptUserIdOrIds });

    return sails.helpers.utils.mapRecords(instanceSubscriptions, 'userId');
  },
};
