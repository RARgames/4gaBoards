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
    const instanceSubscriberIds = sails.helpers.utils.mapRecords(instanceSubscriptions, 'id');
    const adminInstanceSubscribers = await sails.helpers.users.getMany.with({
      criteria: {
        id: instanceSubscriberIds,
        isAdmin: true,
      },
    });
    const adminInstanceSubscribersIds = sails.helpers.utils.mapRecords(adminInstanceSubscribers, 'id');

    return adminInstanceSubscribersIds;
  },
};
