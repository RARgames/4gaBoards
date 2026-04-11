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

  if (!_.isString(value.action.scope)) {
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
    const userPrefs = await sails.helpers.userPrefs.getOne.with({ criteria: { id: values.userId }, currentUser: { id: values.userId } });

    const deliverNotification = userPrefs.notificationTypes.includes(values.action.scope);
    if (!deliverNotification) {
      return null;
    }

    const markAsDelivered = !sails.config.custom.mailServiceAvailable || !userPrefs.emailNotificationsEnabled || !userPrefs.emailNotificationsTypes.includes(values.action.scope);

    const notification = await Notification.create({
      ...values,
      actionId: values.action.id,
      scope: values.action.scope,
      attachmentId: values.action.attachmentId,
      taskId: values.action.taskId,
      commentId: values.action.commentId,
      cardId: values.action.cardId,
      listId: values.action.listId,
      boardId: values.action.boardId,
      projectId: values.action.projectId,
      userAccountId: values.action.userAccountId,
      deliveredAt: markAsDelivered ? new Date().toUTCString() : null,
    }).fetch();

    sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
      item: notification,
    });

    if (markAsDelivered) return notification;

    const mode = userPrefs.emailNotificationsDeliveryMode;
    if (mode === UserPrefs.EmailNotificationsDeliveryModes.INSTANT) {
      await sails.helpers.notifications.sendEmail.with({ notifications: [notification], actionsMap: { [values.action.id]: values.action } });
    } else if (mode === UserPrefs.EmailNotificationsDeliveryModes.INSTANT_THEN_BATCHED) {
      let scopeIdField = `${values.action.scope}Id`;
      if ([Action.Scopes.TASK, Action.Scopes.COMMENT, Action.Scopes.ATTACHMENT].includes(values.action.scope)) {
        scopeIdField = 'cardId';
      } else if (values.action.scope === Action.Scopes.USER) {
        scopeIdField = 'userAccountId';
      }
      const scopeIdValue = values.action[scopeIdField] || null;

      const lastSent = await sails.helpers.notifications.findLastSent.with({
        criteria: {
          userId: notification.userId,
          [scopeIdField]: scopeIdValue,
          deliveredAt: { '!=': null },
        },
      });

      if (!lastSent.length || new Date() - new Date(lastSent[0].deliveredAt) >= sails.config.custom.notificationsMailBatchIntervalMs) {
        await sails.helpers.notifications.sendEmail.with({ notifications: [notification], actionsMap: { [values.action.id]: values.action } });
      }
    }

    return notification;
  },
};
