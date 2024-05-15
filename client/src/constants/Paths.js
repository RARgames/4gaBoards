import Config from './Config';

const ROOT = `${Config.BASE_PATH}/`;
const LOGIN = `${Config.BASE_PATH}/login`;
const REGISTER = `${Config.BASE_PATH}/register`;
const GOOGLE_CALLBACK = `${Config.BASE_PATH}/google-callback`;
const PROJECTS = `${Config.BASE_PATH}/projects/:id`;
const BOARDS = `${Config.BASE_PATH}/boards/:id`;
const CARDS = `${Config.BASE_PATH}/cards/:id`;

export default {
  ROOT,
  LOGIN,
  REGISTER,
  GOOGLE_CALLBACK,
  PROJECTS,
  BOARDS,
  CARDS,
};
