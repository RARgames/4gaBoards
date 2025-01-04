import { call, fork } from 'redux-saga/effects';

import { getAccessToken } from '../utils/access-token-storage';
import coreSaga from './core';
import coreServices from './core/services';
import loginSaga from './login';

export default function* rootSaga() {
  yield fork(coreServices.fetchCoreSettingsPublic);
  const accessToken = yield call(getAccessToken);

  if (!accessToken) {
    yield call(loginSaga);
  }

  yield call(coreSaga);
}
