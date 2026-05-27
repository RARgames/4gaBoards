const crypto = require('crypto');

const { createSignature } = require('../../../utils/systemNotificationSignature');

const Errors = {
  NOTIFICATION_NOT_FOUND: {
    notificationNotFound: 'Notification not found',
  },
  NOT_A_POLL: {
    notAPoll: 'System Notification does not contain a poll',
  },
  INVALID_ANSWER: {
    invalidAnswer: 'Invalid answer',
  },
  CORE_NOT_FOUND: {
    coreNotFound: 'Core not found',
  },
  RESPONSE_SUBMIT_FAILED: {
    responseSubmitFailed: 'Failed to submit system notification response',
  },
};

module.exports = {
  inputs: {
    id: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    answer: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    notificationNotFound: {
      responseType: 'notFound',
    },
    notAPoll: {
      responseType: 'badRequest',
    },
    invalidAnswer: {
      responseType: 'badRequest',
    },
    coreNotFound: {
      responseType: 'notFound',
    },
    responseSubmitFailed: {
      responseType: 'serverError',
    },
  },

  async fn(inputs) {
    const { currentUser } = this.req;

    const notification = await Notification.findOne({
      id: inputs.id,
      userId: currentUser.id,
      deletedAt: null,
    });

    if (!notification) {
      throw Errors.NOTIFICATION_NOT_FOUND;
    }

    const systemNotification = notification.systemNotificationId ? await SystemNotification.findOne({ id: notification.systemNotificationId }) : null;

    if (!systemNotification || systemNotification.type !== 'poll' || !Array.isArray(systemNotification.answers) || systemNotification.answers.length === 0) {
      throw Errors.NOT_A_POLL;
    }

    const validAnswer = systemNotification.answers.some((answer) => answer === inputs.answer);
    if (!validAnswer) {
      throw Errors.INVALID_ANSWER;
    }

    const core = await Core.findOne({ id: 0 });
    if (!core) {
      throw Errors.CORE_NOT_FOUND;
    }

    const responseUrl = `${sails.config.custom.systemNotificationsHostUrl.replace(/\/$/, '')}/api/system-notifications/${systemNotification.systemNotificationId}/responses`;

    const userIdentifier = crypto.createHash('sha256').update(`${core.instanceId}:${currentUser.id}`).digest('hex');
    const data = {
      instanceId: core.instanceId,
      userId: userIdentifier,
      answer: inputs.answer,
    };
    const body = JSON.stringify(data);
    const timestamp = String(Date.now());
    const signature = createSignature({ privateKey: core.systemNotificationResponsesPrivateKey, timestamp, rawBody: body });

    let response;
    try {
      response = await fetch(responseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(signature
            ? {
                'x-4ga-notifications-signature': signature,
                'x-4ga-notifications-timestamp': timestamp,
                'x-4ga-notifications-signature-algorithm': 'ed25519',
              }
            : {}),
        },
        body,
      });
    } catch (err) {
      sails.log.warn('SystemNotifications: Failed to send system notification response:', err.message);
      throw Errors.RESPONSE_SUBMIT_FAILED;
    }

    if (!response.ok) {
      sails.log.warn('SystemNotifications: Failed to send system notification response with status:', response.status);
      throw Errors.RESPONSE_SUBMIT_FAILED;
    }

    const deletedAt = new Date().toUTCString();
    const [deletedNotification] = await sails.helpers.notifications.updateMany.with({
      values: { deletedAt },
      recordsOrIds: [inputs.id],
      currentUser,
      request: this.req,
    });

    return {
      item: deletedNotification,
    };
  },
};
