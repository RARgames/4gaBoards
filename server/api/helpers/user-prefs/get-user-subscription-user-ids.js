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
    const usersSubscribersIds = sails.helpers.utils.mapRecords(userSubscriptions, 'id');
    const adminUsersSubscribers = await sails.helpers.users.getMany.with({
      criteria: {
        id: usersSubscribersIds,
        isAdmin: true,
      },
    });
    const adminUsersSubscribersIds = sails.helpers.utils.mapRecords(adminUsersSubscribers, 'id');

    return adminUsersSubscribersIds;
  },
};
