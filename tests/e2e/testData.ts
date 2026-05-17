export const ADMIN = { username: 'demo', password: 'demo' };

export const TEST_USERS = {
  pm: { username: 'pm_user', password: 'Test@12345', email: 'pm_user@test.com', name: 'PM User' },
  editor: { username: 'editor_user', password: 'Test@12345', email: 'editor_user@test.com', name: 'Editor User' },
  commenter: { username: 'commenter_user', password: 'Test@12345', email: 'commenter_user@test.com', name: 'Commenter User' },
  viewer: { username: 'viewer_user', password: 'Test@12345', email: 'viewer_user@test.com', name: 'Viewer User' },
  nonMember: { username: 'non_member_user', password: 'Test@12345', email: 'non_member@test.com', name: 'Non Member User' },
};

export const TEST_PROJECT_NAME = 'Project 01';

export const ROLES = [
  {
    name: 'Admin',
    user: ADMIN,
    isProjectManager: true,
    canEditBoard: true,
    canManageMembers: true,
  },
  {
    name: 'Project Manager',
    user: TEST_USERS.pm,
    isProjectManager: true,
    canEditBoard: true,
    canManageMembers: true,
  },
  {
    name: 'Board Editor',
    user: TEST_USERS.editor,
    isProjectManager: false,
    canEditBoard: true,
    canManageMembers: false,
  },
  {
    name: 'Board Commenter',
    user: TEST_USERS.commenter,
    isProjectManager: false,
    canEditBoard: false,
    canManageMembers: false,
  },
  {
    name: 'Board Viewer',
    user: TEST_USERS.viewer,
    isProjectManager: false,
    canEditBoard: false,
    canManageMembers: false,
  },
];
