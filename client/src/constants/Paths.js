import Config from './Config';

const ROOT = `${Config.BASE_PATH}/`;
const LOGIN = `${Config.BASE_PATH}/login`;
const REGISTER = `${Config.BASE_PATH}/register`;
const GOOGLE_CALLBACK = `${Config.BASE_PATH}/google-callback`;
const GITHUB_CALLBACK = `${Config.BASE_PATH}/github-callback`;
const MICROSOFT_CALLBACK = `${Config.BASE_PATH}/microsoft-callback`;
const OIDC_CALLBACK = `${Config.BASE_PATH}/oidc-callback`;
const PROJECTS = `${Config.BASE_PATH}/projects/:id`;
const BOARDS = `${Config.BASE_PATH}/boards/:id`;
const CARDS = `${Config.BASE_PATH}/cards/:id`;
const SETTINGS = `${Config.BASE_PATH}/settings`;
const SETTINGS_PROFILE = `${Config.BASE_PATH}/settings/profile`;
const SETTINGS_PREFERENCES = `${Config.BASE_PATH}/settings/preferences`;
const SETTINGS_ACCOUNT = `${Config.BASE_PATH}/settings/account`;
const SETTINGS_AUTHENTICATION = `${Config.BASE_PATH}/settings/authentication`;
const SETTINGS_ABOUT = `${Config.BASE_PATH}/settings/about`;
const SETTINGS_INSTANCE = `${Config.BASE_PATH}/settings/instance`;
const SETTINGS_USERS = `${Config.BASE_PATH}/settings/users`;
const SETTINGS_PROJECT = `${Config.BASE_PATH}/projects/:id/settings`;
const NOTIFICATIONS = `${Config.BASE_PATH}/notifications`;

export default {
  ROOT,
  LOGIN,
  REGISTER,
  GOOGLE_CALLBACK,
  GITHUB_CALLBACK,
  MICROSOFT_CALLBACK,
  OIDC_CALLBACK,
  PROJECTS,
  BOARDS,
  CARDS,
  SETTINGS,
  SETTINGS_PROFILE,
  SETTINGS_PREFERENCES,
  SETTINGS_ACCOUNT,
  SETTINGS_AUTHENTICATION,
  SETTINGS_ABOUT,
  SETTINGS_INSTANCE,
  SETTINGS_USERS,
  SETTINGS_PROJECT,
  NOTIFICATIONS,
};
