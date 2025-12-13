export const ProjectBackgroundTypes = {
  GRADIENT: 'gradient',
  IMAGE: 'image',
};

export const BoardMembershipRoles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const ActivityScopes = {
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

export const ActivityTypes = {
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

  /* BOARD Activities */
  BOARD_CREATE: 'boardCreate',
  BOARD_UPDATE: 'boardUpdate',
  BOARD_DELETE: 'boardDelete',

  /* LABEL Activities */
  LABEL_CREATE: 'labelCreate',
  LABEL_UPDATE: 'labelUpdate',
  LABEL_DELETE: 'labelDelete',

  /* LIST Activities */
  LIST_CREATE: 'listCreate',
  LIST_UPDATE: 'listUpdate',
  LIST_MOVE: 'listMove',
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
  CARD_COMMENT: 'cardComment',
  CARD_COMMENT_CREATE: 'cardCommentCreate',
  CARD_COMMENT_UPDATE: 'cardCommentUpdate',
  CARD_COMMENT_DELETE: 'cardCommentDelete',
};

export const ResizeObserverSizeTypes = {
  OFFSET_HEIGHT: 'offsetHeight',
  OFFSET_WIDTH: 'offsetWidth',
  CLIENT_HEIGHT: 'clientHeight',
  CLIENT_WIDTH: 'clientWidth',
  SCROLL_HEIGHT: 'scrollHeight',
  SCROLL_WIDTH: 'scrollWidth',
  SCROLLABLE: 'scrollable',
};

export const SsoTypes = {
  GOOGLE: 'google',
  GITHUB: 'github',
  MICROSOFT: 'microsoft',
  OIDC: 'oidc',
};

export const PreferredFonts = {
  DEFAULT: 'default',
  MONOSPACE: 'monospace',
};

export const Themes = {
  DEFAULT: 'default',
  GITHUB_DARK: 'github-dark',
};

export const ThemeShapes = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
};
