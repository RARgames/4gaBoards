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
  LIGHT: 'light',
  CUSTOM: 'custom',
};

export const ThemeShapes = {
  DEFAULT: 'default',
  ROUNDED: 'rounded',
};

export const NotificationsDeliveryModes = {
  INSTANT: 'instant',
  BATCHED: 'batched',
  FIRST_INSTANT_THEN_BATCH: 'first_instant_then_batch',
};

export const NotificationsAggregationScopes = {
  CARD: 'card',
  BOARD: 'board',
  LIST: 'list',
  PROJECT: 'project',
  USER: 'user',
};

export const Permissions = {
  API_CLIENT_LIST: 'api-clients.index',
  API_CLIENT_CREATE: 'api-clients.create',
  API_CLIENT_UPDATE: 'api-clients.update',
  API_CLIENT_DELETE: 'api-clients.delete',

  CORE_SETTINGS_UPDATE: 'core.update',

  USER_LIST: 'users.index',
  USER_CREATE: 'users.create',
  USER_DETAILS: 'users.show',
  USER_UPDATE: 'users.update',
  USER_UPDATE_EMAIL: 'users.update-email',
  USER_UPDATE_PASSWORD: 'users.update-password',
  USER_UPDATE_USERNAME: 'users.update-username',
  USER_UPDATE_AVATAR: 'users.update-avatar',
  USER_DELETE: 'users.delete',

  USER_PREFS_DETAILS: 'user-prefs.show',
  USER_PREFS_UPDATE: 'user-prefs.update',

  PROJECT_LIST: 'projects.index',
  PROJECT_CREATE: 'projects.create',
  PROJECT_DETAILS: 'projects.show',
  PROJECT_UPDATE: 'projects.update',
  PROJECT_UPDATE_BACKGROUND_IMAGE: 'projects.update-background-image',
  PROJECT_DELETE: 'projects.delete',
  PROJECT_IMPORT_GETTING_STARTED: 'projects.import-getting-started',

  PROJECT_MANAGER_CREATE: 'project-managers.create',
  PROJECT_MANAGER_DELETE: 'project-managers.delete',

  PROJECT_MEMBERSHIP_LIST: 'project-memberships.index',
  PROJECT_MEMBERSHIP_DETAILS: 'project-memberships.show',
  PROJECT_MEMBERSHIP_UPDATE: 'project-memberships.update',

  BOARD_CREATE: 'boards.create',
  BOARD_DETAILS: 'boards.show',
  BOARD_UPDATE: 'boards.update',
  BOARD_DELETE: 'boards.delete',
  BOARD_EXPORT: 'boards.export',

  BOARD_MEMBERSHIP_CREATE: 'board-memberships.create',
  BOARD_MEMBERSHIP_UPDATE: 'board-memberships.update',
  BOARD_MEMBERSHIP_DELETE: 'board-memberships.delete',

  LABEL_CREATE: 'labels.create',
  LABEL_UPDATE: 'labels.update',
  LABEL_DELETE: 'labels.delete',

  LIST_CREATE: 'lists.create',
  LIST_UPDATE: 'lists.update',
  LIST_DELETE: 'lists.delete',

  CARD_CREATE: 'cards.create',
  CARD_DETAILS: 'cards.show',
  CARD_UPDATE: 'cards.update',
  CARD_DUPLICATE: 'cards.duplicate',
  CARD_DELETE: 'cards.delete',
  CARD_MEMBERSHIP_CREATE: 'card-memberships.create',
  CARD_MEMBERSHIP_DELETE: 'card-memberships.delete',
  CARD_LABEL_CREATE: 'card-labels.create',
  CARD_LABEL_DELETE: 'card-labels.delete',

  MAIL_TOKEN_CREATE: 'mail-tokens.create',
  MAIL_TOKEN_UPDATE: 'mail-tokens.update',
  MAIL_TOKEN_DELETE: 'mail-tokens.delete',

  TASK_CREATE: 'tasks.create',
  TASK_UPDATE: 'tasks.update',
  TASK_DUPLICATE: 'tasks.duplicate',
  TASK_DELETE: 'tasks.delete',
  TASK_MEMBERSHIP_CREATE: 'task-memberships.create',
  TASK_MEMBERSHIP_DELETE: 'task-memberships.delete',

  ATTACHMENT_CREATE: 'attachments.create',
  ATTACHMENT_UPDATE: 'attachments.update',
  ATTACHMENT_DELETE: 'attachments.delete',

  ACTION_ATTACHMENT_LIST: 'actions.index-attachment-actions',
  ACTION_COMMENTS_LIST: 'actions.index-comment-actions',
  ACTION_TASK_LIST: 'actions.index-task-actions',
  ACTION_CARD_LIST: 'actions.index-card-actions',
  ACTION_LIST_LIST: 'actions.index-list-actions',
  ACTION_BOARD_LIST: 'actions.index-board-actions',
  ACTION_PROJECT_LIST: 'actions.index-project-actions',
  ACTION_USER_LIST: 'actions.index-user-actions',
  ACTION_USER_ACCOUNT_LIST: 'actions.index-user-account-actions',
  ACTION_INSTANCE_LIST: 'actions.index-instance-actions',

  COMMENT_LIST: 'comments.index',
  COMMENT_CREATE: 'comments.create',
  COMMENT_UPDATE: 'comments.update',
  COMMENT_DELETE: 'comments.delete',

  NOTIFICATION_LIST: 'notifications.index',
  NOTIFICATION_DETAILS: 'notifications.show',
  NOTIFICATION_UPDATE: 'notifications.update',
  NOTIFICATION_MARK_AS_READ: 'notifications.mark-as-read',
  NOTIFICATION_DELETE: 'notifications.delete',
  NOTIFICATION_DELETE_ALL: 'notifications.delete-all',

  ATTACHMENT_DOWNLOAD: 'attachments.download',
  ATTACHMENT_DOWNLOAD_THUMBNAIL: 'attachments.download-thumbnail',
  BOARD_EXPORT_DOWNLOAD: 'boards.download',
};
