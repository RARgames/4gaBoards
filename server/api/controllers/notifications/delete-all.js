module.exports = {
  inputs: {
    deleteIsReadOnly: {
      type: 'boolean',
      defaultsTo: false,
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const notificationsToDelete = await Notification.find({ userId: currentUser.id, deletedAt: null, ...(inputs.deleteIsReadOnly ? { isRead: true } : {}) });
    const deletedAt = new Date().toUTCString();
    const notifications = await sails.helpers.notifications.updateMany.with({
      values: { deletedAt },
      recordsOrIds: notificationsToDelete.map((n) => n.id),
      currentUser,
      skipBroadcast: true,
      request: this.req,
    });

    sails.sockets.broadcast(
      `user:${currentUser.id}`,
      'notificationDeleteAll',
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
