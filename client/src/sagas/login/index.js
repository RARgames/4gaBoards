import i18n from 'i18next';
import { all, call, cancel, fork, take, spawn, select } from 'redux-saga/effects';

import ActionTypes from '../../constants/ActionTypes';
import selectors from '../../selectors';
import coreServices from '../core/services';
import watchers from './watchers';

function* postLoginSaga() {
  yield take(ActionTypes.CORE_INITIALIZE);

  const user = yield select(selectors.selectCurrentUser);
  if (!user.lastLogin) {
    yield call(coreServices.importGettingStartedProject, { language: i18n.resolvedLanguage });
  }

  const data = {
    lastLogin: new Date(),
  };
  yield call(coreServices.updateCurrentUser, data);
}

export default function* loginSaga() {
  const watcherTasks = yield all(watchers.map((watcher) => fork(watcher)));

  yield take([ActionTypes.AUTHENTICATE__SUCCESS, ActionTypes.AUTHENTICATE_SSO__SUCCESS, ActionTypes.REGISTER__SUCCESS]);
  yield cancel(watcherTasks);
  const preLoginPath = JSON.parse(localStorage.getItem('pre_login_path'));
  if (preLoginPath) {
    localStorage.removeItem('pre_login_path');
    yield call(coreServices.goToPath, preLoginPath);
  } else {
    yield call(coreServices.goToRoot);
  }
  yield spawn(postLoginSaga);
}
