const NEW_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY = {
  avatar: true,
  name: true,
  username: true,
  email: true,
  administrator: true,
  ssoGoogleEmail: false,
  ssoGithubUsername: false,
  ssoGithubEmail: false,
  ssoMicrosoftEmail: false,
  ssoOidcEmail: false,
  lastLogin: true,
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
  actions: true,
};

const NEW_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY = {
  notificationsCount: true,
  coverUrl: false,
  name: true,
  labels: true,
  users: true,
  listName: true,
  hasDescription: true,
  attachmentsCount: true,
  commentCount: true,
  dueDate: true,
  closestDueDate: true,
  timer: true,
  tasks: true,
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
  description: false,
  actions: true,
};

const OLD_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY = {
  avatar: true,
  name: true,
  username: true,
  email: true,
  administrator: true,
  ssoGoogleEmail: true,
  lastLogin: true,
  createdAt: false,
  actions: true,
};

const OLD_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY = {
  notificationsCount: true,
  coverUrl: false,
  name: true,
  labels: true,
  users: true,
  listName: true,
  hasDescription: true,
  attachmentsCount: true,
  commentCount: true,
  dueDate: true,
  closestDueDate: true,
  timer: true,
  tasks: true,
  createdAt: false,
  updatedAt: false,
  description: false,
  actions: true,
};

module.exports.up = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.text('sso_github_email');
  });

  await knex.schema.alterTable('user_prefs', (table) => {
    table.jsonb('users_settings_column_visibility').notNullable().defaultTo(JSON.stringify(NEW_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY)).alter();
    table.jsonb('list_view_column_visibility').notNullable().defaultTo(JSON.stringify(NEW_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY)).alter();
  });
  await knex('user_prefs').update({
    users_settings_column_visibility: JSON.stringify(NEW_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY),
    list_view_column_visibility: JSON.stringify(NEW_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY),
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('user_account', (table) => {
    table.dropColumn('sso_github_email');
  });

  await knex.schema.alterTable('user_prefs', (table) => {
    table.jsonb('users_settings_column_visibility').notNullable().defaultTo(JSON.stringify(OLD_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY)).alter();
    table.jsonb('list_view_column_visibility').notNullable().defaultTo(JSON.stringify(OLD_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY)).alter();
  });
  await knex('user_prefs').update({
    users_settings_column_visibility: JSON.stringify(OLD_DEFAULTS_USERS_SETTINGS_COLUMN_VISIBILITY),
    list_view_column_visibility: JSON.stringify(OLD_DEFAULTS_LIST_VIEW_COLUMN_VISIBILITY),
  });
};
