const valuesValidator = (value) => {
  if (!_.isPlainObject(value)) {
    return false;
  }

  if (!_.isPlainObject(value.user) && !_.isString(value.userId)) {
    return false;
  }

  if (!_.isPlainObject(value.action)) {
    return false;
  }

  return true;
};

module.exports = {
  inputs: {
    values: {
      type: 'ref',
      custom: valuesValidator,
      required: true,
    },
    currentUser: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { values } = inputs;

    if (values.user) {
      values.userId = values.user.id;
    }

    const notification = await Notification.create({
      ...values,
      actionId: values.action.id,
      attachmentId: values.action.attachmentId,
      taskId: values.action.taskId,
      commentId: values.action.commentId,
      cardId: values.action.cardId,
      listId: values.action.listId,
      boardId: values.action.boardId,
      projectId: values.action.projectId,
      userAccountId: values.action.userAccountId,
    }).fetch();

    sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
      item: notification,
    });

    if (!sails.config.custom.mailServiceAvailable) return notification;

    const userPrefs = await UserPrefs.findOne({ id: notification.userId });

    if (!userPrefs?.emailNotificationsEnabled) return notification;

    if (!userPrefs.enabledNotificationTypes?.includes(values.action.scope)) return notification;

    const mode = userPrefs.notificationDeliveryMode || 'instant';
    const now = new Date();
    const TEN_MINUTES = 10 * 60 * 1000;

    switch (mode) {
      case 'instant':
        await sails.helpers.notifications.handleEmailNotification.with({ notification, action: values.action });
        break;

      case 'batched':
        await NotificationBatchQueue.create({
          notificationId: notification.id,
          userId: notification.userId,
          type: values.action.type,
          scope: values.action.scope,
          sentAt: null,
        }).fetch();
        break;

      case 'first_instant_then_batch': {
        const lastSent = await NotificationBatchQueue.find({
          userId: notification.userId,
          scope: values.action.scope,
          sentAt: { '!=': null },
        })
          .sort('sentAt DESC')
          .limit(1);

        if (!lastSent.length || now - new Date(lastSent[0].sentAt) >= TEN_MINUTES) {
          await sails.helpers.notifications.handleEmailNotification.with({ notification, action: values.action });
          await NotificationBatchQueue.create({
            notificationId: notification.id,
            userId: notification.userId,
            type: values.action.type,
            scope: values.action.scope,
            sentAt: now,
          }).fetch();
        } else {
          await NotificationBatchQueue.create({
            notificationId: notification.id,
            userId: notification.userId,
            type: values.action.type,
            scope: values.action.scope,
            sentAt: null,
          }).fetch();
        }
        break;
      }

      default:
        await sails.helpers.notifications.handleEmailNotification.with({ notification, action: values.action });
    }

    return notification;
  },
};
