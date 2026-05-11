const ActivityTypes = {
  /* INSTANCE Activities */
  INSTANCE_UPDATE: 'instanceUpdate',

  /* API CLIENT Activities (scopes: Instance, User) */
  API_CLIENT_CREATE: 'apiClientCreate',
  API_CLIENT_UPDATE: 'apiClientUpdate',
  API_CLIENT_DELETE: 'apiClientDelete',

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

  /* Mail Token Activities */
  MAIL_TOKEN_CREATE: 'mailTokenCreate',
  MAIL_TOKEN_UPDATE: 'mailTokenUpdate',
  MAIL_TOKEN_DELETE: 'mailTokenDelete',

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

export default ActivityTypes;
