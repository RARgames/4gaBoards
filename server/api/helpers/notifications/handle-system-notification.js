const { Scopes: ActionScopes } = require('../../models/Action');

module.exports = {
  inputs: {
    systemNotification: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { systemNotification } = inputs;
    let answers = null;

    if (systemNotification.type === 'poll' && Array.isArray(systemNotification.answers)) {
      answers = systemNotification.answers.filter(Boolean);
    }

    const existingSystemNotification = await SystemNotification.findOne({
      systemNotificationId: systemNotification.id,
    });

    if (existingSystemNotification) {
      const updatedSystemNotification = await SystemNotification.updateOne({ id: existingSystemNotification.id }).set({
        type: systemNotification.type,
        tag: systemNotification.tag,
        title: systemNotification.title,
        content: systemNotification.content,
        answers,
      });

      const existingNotifications = await Notification.find({ systemNotificationId: existingSystemNotification.id });
      await Promise.all(
        existingNotifications.map(async (notif) => {
          sails.sockets.broadcast(`user:${notif.userId}`, 'notificationUpdate', {
            item: {
              ...notif,
              systemType: updatedSystemNotification.type,
              systemTag: updatedSystemNotification.tag,
              systemTitle: updatedSystemNotification.title,
              systemContent: updatedSystemNotification.content,
              systemAnswers: updatedSystemNotification.answers,
            },
          });
        }),
      );

      sails.log.info(`SystemNotifications: Updated system notification ${updatedSystemNotification.systemNotificationId}, broadcasted to ${existingNotifications.length} user(s).`);
      return existingNotifications.length;
    }

    const createdSystemNotification = await SystemNotification.create({
      systemNotificationId: systemNotification.id,
      type: systemNotification.type,
      tag: systemNotification.tag,
      title: systemNotification.title,
      content: systemNotification.content,
      answers,
      targetUsers: systemNotification.targetUsers,
    }).fetch();

    const userQuery = systemNotification.targetUsers === 'admins' ? { isAdmin: true, deletedAt: null } : { deletedAt: null };
    const users = await User.find(userQuery);

    if (!users.length) {
      return 0;
    }

    const notificationValues = {
      scope: ActionScopes.SYSTEM,
      systemNotificationId: createdSystemNotification.id,
      deliveredAt: new Date().toUTCString(), // Skip notifying by email
    };

    let createdCount = 0;
    await Promise.all(
      users.map(async (user) => {
        try {
          const created = await Notification.create({
            ...notificationValues,
            userId: user.id,
            isRead: false,
          }).fetch();

          sails.sockets.broadcast(`user:${user.id}`, 'notificationCreate', {
            item: {
              ...created,
              systemType: systemNotification.type,
              systemTag: systemNotification.tag,
              systemTitle: systemNotification.title,
              systemContent: systemNotification.content,
              systemAnswers: systemNotification.answers,
              systemTargetUsers: systemNotification.targetUsers,
            },
          });
          createdCount += 1;
        } catch (err) {
          sails.log.error(`SystemNotifications: Failed to create notification for user ${user.id}:`, err);
        }
      }),
    );

    sails.log.info(`SystemNotifications: Created ${createdCount} notification(s) from system notification ${createdSystemNotification.systemNotificationId}`);

    return createdCount;
  },
};
