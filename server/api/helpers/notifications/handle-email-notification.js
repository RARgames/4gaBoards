const { fetchRetry } = require('../../../utils/fetchRetry');

module.exports = {
  inputs: {
    notification: {
      type: 'ref',
      required: true,
    },
    action: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ notification, action }) {
    const receiverUserId = notification.userId;

    const user = await User.findOne({ id: receiverUserId });
    if (!user?.email) {
      return;
    }

    const userPrefs = await UserPrefs.findOne({ id: receiverUserId });
    if (!userPrefs?.emailNotificationsEnabled) {
      return;
    }

    if (!userPrefs.enabledNotificationTypes?.includes(action.scope)) {
      return;
    }

    const url = `${process.env.NOTIFICATIONS_HOST_URL}/api/notifications/email`;

    await fetchRetry(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTIFICATIONS_CLIENT_ID}:${process.env.NOTIFICATIONS_CLIENT_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notification.id,
          receiverUserId,
          receiverEmail: user.email,
          deliveryMode: userPrefs.notificationDeliveryMode,
          actorUserId: action.createdById,
          type: action.type,
          scope: action.scope,
          data: action.data,
          createdAt: notification.createdAt,
        }),
      },
      3,
      1000,
    );
  },
};
