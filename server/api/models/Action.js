/**
 * Action.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const { ActivityScopes: Scopes, ActivityTypes: Types } = require('@4gaboards/enums');

const validateInputs = async (values, proceed) => {
  if (values.attachmentId && (!values.cardId || !values.listId || !values.boardId || !values.projectId)) {
    return proceed(Error('cardId, listId, boardId and projectId are required when attachmentId is present'));
  }
  if (values.taskId && (!values.cardId || !values.listId || !values.boardId || !values.projectId)) {
    return proceed(Error('cardId, listId, boardId and projectId are required when taskId is present'));
  }
  if (values.commentId && (!values.cardId || !values.listId || !values.boardId || !values.projectId)) {
    return proceed(Error('cardId, listId, boardId and projectId are required when commentId is present'));
  }
  if (values.cardId && (!values.listId || !values.boardId || !values.projectId)) {
    return proceed(Error('listId, boardId and projectId are required when cardId is present'));
  }
  if (values.listId && (!values.boardId || !values.projectId)) {
    return proceed(new Error('boardId and projectId are required when listId is present'));
  }
  if (values.boardId && !values.projectId) {
    return proceed(new Error('projectId is required when boardId is present'));
  }
  return proceed();
};

module.exports = {
  Scopes,
  Types,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    scope: {
      type: 'string',
      isIn: Object.values(Scopes),
      required: true,
    },
    type: {
      type: 'string',
      isIn: Object.values(Types),
      required: true,
    },
    data: {
      type: 'json',
      required: true,
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    attachmentId: {
      model: 'Attachment',
      columnName: 'attachment_id',
    },
    taskId: {
      model: 'Task',
      columnName: 'task_id',
    },
    commentId: {
      model: 'Comment',
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
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
    userAccountId: {
      model: 'User',
      columnName: 'user_account_id',
    },
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    coreId: {
      model: 'Core',
      columnName: 'core_id',
    },
    duplicateOfId: {
      model: 'Action',
      columnName: 'duplicate_of_id',
    },
  },

  beforeCreate(record, proceed) {
    sails.config.models.beforeCreate(record, async () => {
      // eslint-disable-next-line no-param-reassign
      record.coreId = 0;
      await validateInputs(record, proceed);
    });
  },

  beforeUpdate(record, proceed) {
    sails.config.models.beforeUpdate(record, async () => {
      await validateInputs(record, proceed);
    });
  },
};
