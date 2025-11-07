/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'GET /auth/google': 'AuthController.google',
  'GET /auth/google/callback': 'AuthController.googleCallback',
  'GET /auth/github': 'AuthController.github',
  'GET /auth/github/callback': 'AuthController.githubCallback',
  'GET /auth/microsoft': 'AuthController.microsoft',
  'GET /auth/microsoft/callback': 'AuthController.microsoftCallback',
  'GET /auth/oidc': 'AuthController.oidc',
  'GET /auth/oidc/callback': 'AuthController.oidcCallback',

  'POST /api/access-tokens': 'access-tokens/create',
  'DELETE /api/access-tokens/me': 'access-tokens/delete',

  'POST /api/register': 'register/create',

  'GET /api/core-settings-public': 'core/show',
  'POST /api/core-settings': 'core/update',

  'GET /api/user-projects': 'user-projects/index',
  'GET /api/user-projects/:projectId': 'user-projects/show',
  'PATCH /api/user-projects/:projectId': 'user-projects/update',

  'GET /api/users': 'users/index',
  'POST /api/users': 'users/create',
  'GET /api/users/:id': 'users/show',
  'PATCH /api/users/:id': 'users/update',
  'PATCH /api/users/:id/email': 'users/update-email',
  'PATCH /api/users/:id/password': 'users/update-password',
  'PATCH /api/users/:id/username': 'users/update-username',
  'POST /api/users/:id/avatar': 'users/update-avatar',
  'DELETE /api/users/:id': 'users/delete',

  'GET /api/user-prefs/:id': 'user-prefs/show',
  'PATCH /api/user-prefs/:id': 'user-prefs/update',

  'GET /api/projects': 'projects/index',
  'POST /api/projects': 'projects/create',
  'GET /api/projects/:id': 'projects/show',
  'PATCH /api/projects/:id': 'projects/update',
  'POST /api/projects/:id/background-image': 'projects/update-background-image',
  'DELETE /api/projects/:id': 'projects/delete',
  'GET /api/projects/import-getting-started': 'projects/import-getting-started',

  'POST /api/projects/:projectId/managers': 'project-managers/create',
  'DELETE /api/project-managers/:id': 'project-managers/delete',

  'POST /api/projects/:projectId/boards': 'boards/create',
  'GET /api/boards/:id': 'boards/show',
  'PATCH /api/boards/:id': 'boards/update',
  'DELETE /api/boards/:id': 'boards/delete',
  'GET /api/boards/:id/export': 'boards/export',

  'POST /api/boards/:boardId/memberships': 'board-memberships/create',
  'PATCH /api/board-memberships/:id': 'board-memberships/update',
  'DELETE /api/board-memberships/:id': 'board-memberships/delete',

  'POST /api/boards/:boardId/labels': 'labels/create',
  'PATCH /api/labels/:id': 'labels/update',
  'DELETE /api/labels/:id': 'labels/delete',

  'POST /api/boards/:boardId/lists': 'lists/create',
  'PATCH /api/lists/:id': 'lists/update',
  'DELETE /api/lists/:id': 'lists/delete',

  'POST /api/lists/:listId/cards': 'cards/create',
  'GET /api/cards/:id': 'cards/show',
  'PATCH /api/cards/:id': 'cards/update',
  'POST /api/cards/:id/duplicate': 'cards/duplicate',
  'DELETE /api/cards/:id': 'cards/delete',
  'POST /api/cards/:cardId/memberships': 'card-memberships/create',
  'DELETE /api/cards/:cardId/memberships': 'card-memberships/delete',
  'POST /api/cards/:cardId/labels': 'card-labels/create',
  'DELETE /api/cards/:cardId/labels/:labelId': 'card-labels/delete',

  'POST /api/cards/:cardId/tasks': 'tasks/create',
  'PATCH /api/tasks/:id': 'tasks/update',
  'POST /api/tasks/:id/duplicate': 'tasks/duplicate',
  'DELETE /api/tasks/:id': 'tasks/delete',
  'POST /api/tasks/:taskId/memberships': 'task-memberships/create',
  'DELETE /api/tasks/:taskId/memberships': 'task-memberships/delete',

  'POST /api/cards/:cardId/attachments': 'attachments/create',
  'PATCH /api/attachments/:id': 'attachments/update',
  'DELETE /api/attachments/:id': 'attachments/delete',

  'GET /api/cards/:cardId/actions': 'actions/index',

  'POST /api/cards/:cardId/comment-actions': 'comment-actions/create',
  'PATCH /api/comment-actions/:id': 'comment-actions/update',
  'DELETE /api/comment-actions/:id': 'comment-actions/delete',

  'GET /api/notifications': 'notifications/index',
  'GET /api/notifications/:id': 'notifications/show',
  'PATCH /api/notifications/:ids': 'notifications/update',
  'PATCH /api/notifications': 'notifications/mark-all-as',
  'DELETE /api/notifications/:ids': 'notifications/delete',
  'DELETE /api/notifications': 'notifications/delete-all',

  'GET /attachments/:id/download/:filename': {
    action: 'attachments/download',
    skipAssets: false,
  },

  'GET /attachments/:id/download/thumbnails/cover-256.:extension': {
    action: 'attachments/download-thumbnail',
    skipAssets: false,
  },

  'GET /exports/:id/:filename': {
    action: 'boards/download',
    skipAssets: false,
  },

  'GET /*': {
    view: 'index',
    skipAssets: true,
  },
};
