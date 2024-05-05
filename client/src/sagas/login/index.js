import { all, call, cancel, fork, take, spawn } from 'redux-saga/effects';
import watchers from './watchers';
import services from './services';
import bestServices from '../core/services';
import ActionTypes from '../../constants/ActionTypes';

function* postLoginSaga() {
  yield take(ActionTypes.CORE_INITIALIZE);
  const data = {
    lastLogin: new Date().toUTCString(),
  };
  yield call(bestServices.updateCurrentUser, data);
}

export default function* loginSaga() {
  const watcherTasks = yield all(watchers.map((watcher) => fork(watcher)));

  yield fork(services.setGoogleButton);
  yield take(ActionTypes.AUTHENTICATE__SUCCESS);
  yield cancel(watcherTasks);
  yield call(services.goToRoot);
  yield spawn(postLoginSaga);
}
