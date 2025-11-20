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
  // TODO Add all activity types

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
  CARD_COMMENT: 'cardComment',
  CARD_COMMENT_CREATE: 'cardCommentCreate',
  CARD_COMMENT_UPDATE: 'cardCommentUpdate',
  CARD_COMMENT_DELETE: 'cardCommentDelete',
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

    cardId: {
      model: 'Card',
      required: true,
      columnName: 'card_id',
    },
    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    projectId: {
      model: 'Project',
      required: true,
      columnName: 'project_id',
    },
    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
    createdById: {
      model: 'User',
      required: true,
      columnName: 'created_by_id',
    },
    updatedById: {
      model: 'User',
      columnName: 'updated_by_id',
    },
  },
};
