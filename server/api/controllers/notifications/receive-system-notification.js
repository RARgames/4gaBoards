/**
 * Public endpoint called by 4gaBoardsNotifications to push a notification to 4gaBoards
 * Authentication uses instanceId + signature verified with stored system notifications public key
 */
const { verifySignature } = require('../../../utils/systemNotificationSignature');

const Errors = {
  UNAUTHORIZED: {
    unauthorized: 'Invalid instanceId',
  },
  INVALID_SIGNATURE: {
    invalidSignature: 'Invalid signature',
  },
  INVALID_PAYLOAD: {
    invalidPayload: 'Invalid notification payload',
  },
};

module.exports = {
  inputs: {
    instanceId: {
      type: 'string',
      required: true,
    },
    id: {
      type: 'string',
      required: true,
    },
    type: {
      type: 'string',
      required: true,
      isIn: ['default', 'poll'],
    },
    title: {
      type: 'string',
      required: true,
    },
    content: {
      type: 'string',
      allowNull: true,
    },
    answers: {
      type: 'ref',
    },
    targetUsers: {
      type: 'string',
      required: true,
      isIn: ['admins', 'all'],
    },
  },

  exits: {
    unauthorized: {
      responseType: 'unauthorized',
    },
    invalidSignature: {
      responseType: 'unauthorized',
    },
    invalidPayload: {
      responseType: 'badRequest',
    },
  },

  async fn(inputs) {
    const core = await Core.findOne({ id: 0 });
    if (!core || !core.instanceId || core.instanceId !== inputs.instanceId) {
      throw Errors.UNAUTHORIZED;
    }
    if (!core.systemNotificationsPublicKey) {
      sails.log.warn('SystemNotifications: Missing system notifications public key, rejecting external request.');
      throw Errors.INVALID_SIGNATURE;
    }

    const isValidSignature = verifySignature({
      publicKey: core.systemNotificationsPublicKey,
      signature: this.req.headers['x-4ga-notifications-signature'],
      timestamp: this.req.headers['x-4ga-notifications-timestamp'],
      signatureAlgorithm: this.req.headers['x-4ga-notifications-signature-algorithm'],
      rawBody: JSON.stringify(this.req.body),
    });

    if (!isValidSignature) {
      sails.log.warn('SystemNotifications: Signature verification failed for receive-system request.');
      throw Errors.INVALID_SIGNATURE;
    }

    if (inputs.type === 'poll' && (!Array.isArray(inputs.answers) || inputs.answers.length === 0)) {
      throw Errors.INVALID_PAYLOAD;
    }

    const systemNotification = {
      id: inputs.id,
      type: inputs.type,
      title: inputs.title,
      content: inputs.content,
      answers: inputs.answers,
      targetUsers: inputs.targetUsers,
    };

    const count = await sails.helpers.notifications.handleSystemNotification.with({ systemNotification });

    return {
      success: true,
      notificationsCreatedCount: count,
    };
  },
};
