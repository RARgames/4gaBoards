module.exports = {
  inputs: {
    isRead: {
      type: 'boolean',
      required: true,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const values = _.pick(inputs, ['isRead']);

    const notificationsToUpdate = await Notification.find({ userId: currentUser.id, isRead: !values.isRead, deletedAt: null });
    const notifications = await sails.helpers.notifications.updateMany.with({
      values,
      recordsOrIds: notificationsToUpdate.map((n) => n.id),
      currentUser,
      skipBroadcast: true,
      request: this.req,
    });

    sails.sockets.broadcast(
      `user:${currentUser.id}`,
      'notificationMarkAllAs',
      {
        item: notifications,
      },
      this.req,
    );

    return {
      items: notifications,
    };
  },
};
