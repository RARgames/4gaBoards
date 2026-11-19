import { all, apply, fork, take } from 'redux-saga/effects';

import { socket } from '../../api';
import ActionTypes from '../../constants/ActionTypes';
import Paths from '../../constants/Paths';
import services from './services';
import watchers from './watchers';

export default function* coreSaga() {
  yield all(watchers.map((watcher) => fork(watcher)));

  yield apply(socket, socket.connect);
  yield fork(services.initializeCore);
  yield fork(services.handleLocationChange); // HttpOnly-cookie change made startup asynchronous: the app now checks the session before choosing the login or authenticated saga, without this logged in user would not be redirected from /login when accessing /login page directly with a valid session cookie

  yield take(ActionTypes.LOGOUT);

  window.location.href = Paths.LOGIN;
}
