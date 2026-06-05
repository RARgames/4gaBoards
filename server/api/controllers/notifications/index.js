module.exports = {
  async fn() {
    const { currentUser } = this.req;

    const notifications = await sails.helpers.users.getNotifications(currentUser.id);
    const enrichedNotifications = await sails.helpers.notifications.attachSystemData.with({
      notifications,
    });

    const actionIds = sails.helpers.utils.mapRecords(notifications, 'actionId').filter((id) => id != null);
    const actions = await sails.helpers.actions.getMany(actionIds);

    const userIds = sails.helpers.utils.mapRecords(actions, 'userId', true);
    const users = await sails.helpers.users.getMany(userIds, true);
    const sanitizedUsers = await sails.helpers.users.sanitize(users, currentUser);

    const cardIds = sails.helpers.utils.mapRecords(notifications, 'cardId').filter((id) => id != null);
    const cards = await sails.helpers.cards.getMany(cardIds);

    return {
      items: enrichedNotifications,
      included: {
        users: sanitizedUsers,
        ...(cards?.length ? { cards } : {}),
        actions: actions.map((action) => ({ ...action, notificationOnly: true })),
      },
    };
  },
};
