/**
 * SystemNotification.js
 *
 * Source notification payload received from 4gaBoardsNotifications
 * Per user delivery state stays in Notification (this is more like action state)
 */

module.exports = {
  attributes: {
    systemNotificationId: {
      type: 'string',
      required: true,
      unique: true,
      isUUID: true,
      columnName: 'system_notification_id',
    },
    type: {
      type: 'string',
      required: true,
      isIn: ['default', 'poll'],
      columnName: 'type',
    },
    tag: {
      type: 'string',
      required: true,
      columnName: 'tag',
    },
    title: {
      type: 'string',
      required: true,
      columnName: 'title',
    },
    content: {
      type: 'string',
      allowNull: true,
      columnName: 'content',
    },
    answers: {
      type: 'json',
      columnName: 'answers',
    },
    targetUsers: {
      type: 'string',
      required: true,
      isIn: ['admins', 'all'],
      columnName: 'target_users',
    },
  },

  tableName: 'system_notification',
};
