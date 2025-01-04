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

  yield take(ActionTypes.LOGOUT);

  window.location.href = Paths.LOGIN;
}
