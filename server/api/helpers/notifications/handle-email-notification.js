const { fetchRetry } = require('../../../utils/fetchRetry');

module.exports = {
  inputs: {
    notifications: {
      type: 'ref',
      required: true,
    },
    actionsMap: {
      type: 'ref',
      required: true,
    },
  },

  async fn({ notifications, actionsMap }) {
    const now = new Date();
    const beginningOfTime = new Date(0);

    let firstNotification;
    let firstAction;
    // eslint-disable-next-line no-restricted-syntax
    for (const notification of notifications) {
      const action = actionsMap[notification.actionId];
      if (!action) {
        // eslint-disable-next-line no-await-in-loop
        await Notification.update({ id: notification.id }).set({ deliveredAt: beginningOfTime });
      } else {
        firstNotification = notification;
        firstAction = action;
        break;
      }
    }
    if (!firstAction) return;

    const receiverUserId = firstNotification.userId;
    const user = await User.findOne({ id: receiverUserId });

    let { scope } = firstAction;
    if ([Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(scope)) {
      scope = Action.Scopes.CARD;
    }
    const scopeNameField = `${scope}Name`;
    const scopeNameValue = firstAction.data[scopeNameField] || null;
    const subject = `[${scope}]: ${scopeNameValue} | 4ga Boards Notifications (${sails.config.custom.instanceName})`;

    const messageLines = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const notification of notifications) {
      const action = actionsMap[notification.actionId];
      // eslint-disable-next-line no-continue
      if (!action) continue;

      // eslint-disable-next-line no-await-in-loop
      const actionUser = await User.findOne({ id: action.userId });
      messageLines.push(`From: ${actionUser.username} (${actionUser.name})`);
      const { type } = action;
      const dataEntries = Object.entries(action.data || {});
      if (!dataEntries.length) {
        messageLines.push(`• ${type}`);
        // eslint-disable-next-line no-continue
        continue;
      }

      const changes = dataEntries.map(([key, value]) => `  - ${key}: ${value}`).join('\n');
      messageLines.push(`• ${type}\n${changes}`);
    }
    const message = messageLines.join('\n\n');

    try {
      const url = `${process.env.NOTIFICATIONS_HOST_URL}/api/notifications/email`;
      const response = await fetchRetry(
        url,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NOTIFICATIONS_CLIENT_ID}:${process.env.NOTIFICATIONS_CLIENT_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiverUserId,
            receiverEmail: user.email,
            subject,
            message,
          }),
        },
        3,
        1000,
      );

      const responseJson = await response.json();
      if (!response.ok || responseJson.status !== 'sent') {
        sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, responseJson);
      }

      const ids = notifications.map((n) => n.id);
      await Notification.update({ id: ids }).set({ deliveredAt: now });
    } catch (err) {
      sails.log.error(`Failed to send notifications to user ${receiverUserId}:`, err);
    }
  },
};
