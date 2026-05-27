module.exports = {
  inputs: {
    notifications: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const notifications = _.isArray(inputs.notifications) ? inputs.notifications : [inputs.notifications];
    const systemNotificationIds = _.chain(notifications).map('systemNotificationId').compact().uniq().value();
    if (systemNotificationIds.length === 0) {
      return _.isArray(inputs.notifications) ? notifications : notifications[0];
    }

    const systemNotifications = await SystemNotification.find({ id: systemNotificationIds });
    const systemNotificationsById = _.keyBy(systemNotifications, 'id');
    const enrichedNotifications = notifications.map((notification) => {
      const systemNotification = systemNotificationsById[notification.systemNotificationId];

      if (!systemNotification) {
        return notification;
      }

      return {
        ...notification,
        systemType: systemNotification.type,
        systemTitle: systemNotification.title,
        systemContent: systemNotification.content,
        systemAnswers: systemNotification.answers,
        systemTargetUsers: systemNotification.targetUsers,
      };
    });

    return _.isArray(inputs.notifications) ? enrichedNotifications : enrichedNotifications[0];
  },
};
