const { Scopes: ActionScopes } = require('./Action');

/**
 * Notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    isRead: {
      type: 'boolean',
      defaultsTo: false,
      columnName: 'is_read',
    },
    scope: {
      type: 'string',
      required: true,
      isIn: Object.values(ActionScopes),
    },
    deletedAt: {
      type: 'ref',
      columnName: 'deleted_at',
    },
    // Used for email notifications:
    // - null - waiting to be sent
    // - timestamp - it was sent
    // - timestamp - user don't want email notifications (user prefs)
    // - timestamp - in batch mode user already marked notification as read (user prefs)
    deliveredAt: {
      type: 'ref',
      columnName: 'delivered_at',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
    actionId: {
      model: 'Action',
      required: true,
      columnName: 'action_id',
    },
    attachmentId: {
      model: 'Attachment',
      columnName: 'attachment_id',
    },
    taskId: {
      model: 'Task',
      columnName: 'task_id',
    },
    commentId: {
      model: 'Action',
      columnName: 'comment_id',
    },
    cardId: {
      model: 'Card',
      columnName: 'card_id',
    },
    listId: {
      model: 'List',
      columnName: 'list_id',
    },
    boardId: {
      model: 'Board',
      columnName: 'board_id',
    },
    projectId: {
      model: 'Project',
      columnName: 'project_id',
    },
    userAccountId: {
      model: 'User',
      columnName: 'user_account_id',
    },
    coreId: {
      model: 'Core',
      columnName: 'core_id',
    },
  },

  beforeCreate(record, proceed) {
    sails.config.models.beforeCreate(record, async () => {
      // eslint-disable-next-line no-param-reassign
      record.coreId = 0;
      proceed();
    });
  },
};
