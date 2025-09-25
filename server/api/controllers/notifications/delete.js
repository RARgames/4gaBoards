const Errors = {
  INSUFFICIENT_PERMISSIONS: {
    insufficientPermissions: 'Insufficient permissions',
  },
};

module.exports = {
  inputs: {
    ids: {
      type: 'string',
      required: true,
      regex: /^[0-9]+(,[0-9]+)*$/,
    },
  },

  exits: {
    insufficientPermissions: {
      responseType: 'forbidden',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;
    const ids = inputs.ids.split(',');

    const notificationsToDelete = await Notification.find({ id: ids });
    notificationsToDelete.forEach((notification) => {
      if (notification.userId !== currentUser.id) {
        throw Errors.INSUFFICIENT_PERMISSIONS;
      }
    });

    const notifications = await sails.helpers.notifications.updateMany.with({
      values: { deletedAt: new Date() },
      recordsOrIds: ids,
      currentUser,
      request: this.req,
    });

    return {
      items: notifications,
    };
  },
};
