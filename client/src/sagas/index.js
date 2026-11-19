import { call, fork } from 'redux-saga/effects';

import api from '../api';
import { SsoTypes } from '../constants/Enums';
import Paths from '../constants/Paths';
import coreSaga from './core';
import coreServices from './core/services';
import loginSaga from './login';

export default function* rootSaga() {
  yield fork(coreServices.fetchCoreSettingsPublic);
  let hasSession = false;
  try {
    yield call(api.getCurrentSession);
    hasSession = true;
  } catch {} // eslint-disable-line no-empty

  const ssoProvider = {
    [Paths.GOOGLE_CALLBACK]: SsoTypes.GOOGLE,
    [Paths.GITHUB_CALLBACK]: SsoTypes.GITHUB,
    [Paths.MICROSOFT_CALLBACK]: SsoTypes.MICROSOFT,
    [Paths.OIDC_CALLBACK]: SsoTypes.OIDC,
  }[window.location.pathname];

  if (!hasSession || ssoProvider) {
    yield call(loginSaga, ssoProvider);
  }

  yield call(coreSaga);
}
