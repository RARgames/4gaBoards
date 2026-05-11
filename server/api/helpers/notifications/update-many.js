const recordsOrIdsValidator = (value) => _.every(value, _.isPlainObject) || _.every(value, _.isString);

module.exports = {
  inputs: {
    recordsOrIds: {
      type: 'json',
      custom: recordsOrIdsValidator,
      required: true,
    },
    values: {
      type: 'json',
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
    skipBroadcast: {
      type: 'boolean',
      defaultsTo: false,
    },
    request: {
      type: 'ref',
    },
  },

  async fn(inputs) {
    const { values, currentUser, skipBroadcast } = inputs;

    const criteria = {};

    if (_.every(inputs.recordsOrIds, _.isPlainObject)) {
      criteria.id = sails.helpers.utils.mapRecords(inputs.recordsOrIds);
    } else if (_.every(inputs.recordsOrIds, _.isString)) {
      criteria.id = inputs.recordsOrIds;
    }

    criteria.userId = currentUser.id;

    const notifications = await Notification.update(criteria)
      .set({ ...values })
      .fetch();

    if (!skipBroadcast) {
      notifications.forEach((notification) => {
        sails.sockets.broadcast(
          `user:${notification.userId}`,
          'notificationUpdate',
          {
            item: notification,
          },
          inputs.request,
        );
      });
    }

    return notifications;
  },
};
