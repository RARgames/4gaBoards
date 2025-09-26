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
    isRead: {
      type: 'boolean',
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

    const notificationsToUpdate = await Notification.find({ id: ids });
    notificationsToUpdate.forEach((notification) => {
      if (notification.userId !== currentUser.id) {
        throw Errors.INSUFFICIENT_PERMISSIONS;
      }
    });

    const values = _.pick(inputs, ['isRead']);

    const notifications = await sails.helpers.notifications.updateMany.with({
      values,
      recordsOrIds: ids,
      currentUser,
      request: this.req,
    });

    return {
      items: notifications,
    };
  },
};
