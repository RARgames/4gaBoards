export const ProjectBackgroundTypes = {
  GRADIENT: 'gradient',
  IMAGE: 'image',
};

export const BoardMembershipRoles = {
  EDITOR: 'editor',
  VIEWER: 'viewer',
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
  INSTANT_THEN_BATCHED: 'instant_then_batched',
};

export const Permissions = {
  APICLIENT_LIST: 'api-clients.index',
  APICLIENT_CREATE: 'api-clients.create',
  APICLIENT_UPDATE: 'api-clients.update',
  APICLIENT_DELETE: 'api-clients.delete',

  CORESETTINGS_UPDATE: 'core.update',

  USER_LIST: 'users.index',
  USER_CREATE: 'users.create',
  USER_DETAILS: 'users.show',
  USER_UPDATE: 'users.update',
  USER_UPDATE_EMAIL: 'users.update-email',
  USER_UPDATE_PASSWORD: 'users.update-password',
  USER_UPDATE_USERNAME: 'users.update-username',
  USER_UPDATE_AVATAR: 'users.update-avatar',
  USER_DELETE: 'users.delete',

  USERPREFS_DETAILS: 'user-prefs.show',
  USERPREFS_UPDATE: 'user-prefs.update',

  PROJECT_LIST: 'projects.index',
  PROJECT_CREATE: 'projects.create',
  PROJECT_DETAILS: 'projects.show',
  PROJECT_UPDATE: 'projects.update',
  PROJECT_UPDATE_BACKGROUND_IMAGE: 'projects.update-background-image',
  PROJECT_DELETE: 'projects.delete',
  PROJECT_IMPORT_GETTING_STARTED: 'projects.import-getting-started',

  PROJECTMANAGER_CREATE: 'project-managers.create',
  PROJECTMANAGER_DELETE: 'project-managers.delete',

  PROJECTMEMBERSHIP_LIST: 'project-memberships.index',
  PROJECTMEMBERSHIP_DETAILS: 'project-memberships.show',
  PROJECTMEMBERSHIP_UPDATE: 'project-memberships.update',

  BOARD_CREATE: 'boards.create',
  BOARD_DETAILS: 'boards.show',
  BOARD_UPDATE: 'boards.update',
  BOARD_DELETE: 'boards.delete',
  BOARD_EXPORT: 'boards.export',

  BOARDMEMBERSHIP_CREATE: 'board-memberships.create',
  BOARDMEMBERSHIP_UPDATE: 'board-memberships.update',
  BOARDMEMBERSHIP_DELETE: 'board-memberships.delete',

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

  CARDMEMBERSHIP_CREATE: 'card-memberships.create',
  CARDMEMBERSHIP_DELETE: 'card-memberships.delete',

  CARDLABEL_CREATE: 'card-labels.create',
  CARDLABEL_DELETE: 'card-labels.delete',

  MAILTOKEN_LIST_ID: 'mail-tokens.get-list-id',
  MAILTOKEN_CREATE: 'mail-tokens.create',
  MAILTOKEN_UPDATE: 'mail-tokens.update',
  MAILTOKEN_DELETE: 'mail-tokens.delete',

  TASK_CREATE: 'tasks.create',
  TASK_UPDATE: 'tasks.update',
  TASK_DUPLICATE: 'tasks.duplicate',
  TASK_DELETE: 'tasks.delete',

  TASKMEMBERSHIP_CREATE: 'task-memberships.create',
  TASKMEMBERSHIP_DELETE: 'task-memberships.delete',

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
