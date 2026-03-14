module.exports = {
  tableName: 'notification_batch_queue',

  attributes: {
    notificationId: {
      type: 'string',
      required: true,
      columnName: 'notification_id',
    },
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
    type: {
      type: 'string',
      required: true,
    },
    scope: {
      type: 'string',
      required: true,
    },
    createdAt: {
      type: 'ref',
      columnType: 'timestamp',
      autoCreatedAt: true,
      columnName: 'created_at',
    },
    updatedAt: {
      type: 'ref',
      columnType: 'timestamp',
      autoUpdatedAt: true,
      columnName: 'updated_at',
    },
    sentAt: {
      type: 'ref',
      columnType: 'timestamp',
      columnName: 'sent_at',
    },
  },
};
