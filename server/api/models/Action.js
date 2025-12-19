/**
 * Action.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Scopes = {
  INSTANCE: 'instance',
  USER: 'user',
  PROJECT: 'project',
  BOARD: 'board',
  LIST: 'list',
  CARD: 'card',
  TASK: 'task',
  COMMENT: 'comment',
  ATTACHMENT: 'attachment',
};

const Types = {
  /* INSTANCE Activities */
  INSTANCE_UPDATE: 'instanceUpdate',

  /* USER Activities */
  USER_CREATE: 'userCreate',
  USER_REGISTER: 'userRegister',
  USER_UPDATE: 'userUpdate',
  USER_DELETE: 'userDelete',

  /* PROJECT Activities */
  PROJECT_CREATE: 'projectCreate',
  PROJECT_UPDATE: 'projectUpdate',
  PROJECT_DELETE: 'projectDelete',

  /* PROJECT Manager Activities */
  PROJECT_MANAGER_ADD: 'projectManagerAdd',
  PROJECT_MANAGER_REMOVE: 'projectManagerRemove',

  /* BOARD Activities */
  BOARD_CREATE: 'boardCreate',
  BOARD_UPDATE: 'boardUpdate',
  BOARD_DELETE: 'boardDelete',

  /* BOARD User Activities */
  BOARD_USER_ADD: 'boardUserAdd',
  BOARD_USER_UPDATE: 'boardUserUpdate',
  BOARD_USER_REMOVE: 'boardUserRemove',

  /* LABEL Activities */
  LABEL_CREATE: 'labelCreate',
  LABEL_UPDATE: 'labelUpdate',
  LABEL_DELETE: 'labelDelete',

  /* LIST Activities */
  LIST_CREATE: 'listCreate',
  LIST_UPDATE: 'listUpdate',
  LIST_DELETE: 'listDelete',

  /* CARD Activities */
  CARD_CREATE: 'cardCreate',
  CARD_DUPLICATE: 'cardDuplicate',
  CARD_UPDATE: 'cardUpdate',
  CARD_MOVE: 'cardMove',
  CARD_TRANSFER: 'cardTransfer',
  CARD_DELETE: 'cardDelete',

  /* CARD User Activities */
  CARD_USER_ADD: 'cardUserAdd',
  CARD_USER_REMOVE: 'cardUserRemove',

  /* CARD Task Activities */
  CARD_TASK_CREATE: 'cardTaskCreate',
  CARD_TASK_UPDATE: 'cardTaskUpdate',
  CARD_TASK_DUPLICATE: 'cardTaskDuplicate',
  CARD_TASK_MOVE: 'cardTaskMove',
  CARD_TASK_DELETE: 'cardTaskDelete',

  /* CARD Task User Activities */
  CARD_TASK_USER_ADD: 'cardTaskUserAdd',
  CARD_TASK_USER_REMOVE: 'cardTaskUserRemove',

  /* CARD Attachment Activities */
  CARD_ATTACHMENT_CREATE: 'cardAttachmentCreate',
  CARD_ATTACHMENT_UPDATE: 'cardAttachmentUpdate',
  CARD_ATTACHMENT_DELETE: 'cardAttachmentDelete',

  /* CARD Label Activities */
  CARD_LABEL_ADD: 'cardLabelAdd',
  CARD_LABEL_REMOVE: 'cardLabelRemove',

  /* CARD Comment Activities */
  CARD_COMMENT_CREATE: 'cardCommentCreate',
  CARD_COMMENT_UPDATE: 'cardCommentUpdate',
  CARD_COMMENT_DELETE: 'cardCommentDelete',
};

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
  },

  beforeCreate(record, proceed) {
    sails.config.models.beforeCreate(record, async () => {
      await validateInputs(record, proceed);
    });
  },
  beforeUpdate(record, proceed) {
    sails.config.models.beforeUpdate(record, async () => {
      await validateInputs(record, proceed);
    });
  },
};
