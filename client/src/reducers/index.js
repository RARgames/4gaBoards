import { combineReducers } from 'redux';

import auth from './auth';
import core from './core';
import orm from './orm';
import router from './router';
import socket from './socket';
import ui from './ui';

export default combineReducers({
  auth,
  core,
  orm,
  router,
  socket,
  ui,
});
