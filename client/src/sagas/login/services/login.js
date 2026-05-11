import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import Paths from '../../../constants/Paths';
import { replace } from '../../../lib/redux-router';
import selectors from '../../../selectors';
import { setAccessToken } from '../../../utils/access-token-storage';

export function* authenticate(data) {
  yield put(actions.authenticate(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.createAccessToken, data));
  } catch (error) {
    yield put(actions.authenticate.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.authenticate.success(accessToken));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export function* authenticateSso(provider, method) {
  yield put(actions.authenticateSso(provider, method));
  const { ssoUrls } = yield select(selectors.selectCoreSettings);
  let ssoUrl = ssoUrls[provider];
  if (!ssoUrl) {
    yield put(actions.authenticateSso.failure(provider, { code: 'E_NOT_FOUND', message: 'SSO URL not found' }));
    return;
  }
  if (method) {
    const url = new URL(ssoUrl);
    url.searchParams.set('kc_idp_hint', method.toLowerCase());
    ssoUrl = url.toString();
  }

  window.location.replace(ssoUrl);
}

export function* authenticateSsoCallback(provider) {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const err = params.get('error');
  yield put(replace(Paths.LOGIN));

  if (err !== null) {
    yield put(actions.authenticateSso.failure(provider, { code: 'E_UNAUTHORIZED', message: err }));
    return;
  }
  if (accessToken !== null) {
    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateSso.success(provider, accessToken));
  } else {
    yield put(actions.authenticateSso.failure(provider, { code: 'E_UNAUTHORIZED', message: 'Unknown error' }));
  }
}

export function* registerOpen() {
  yield put(actions.registerOpen());
  yield put(replace(Paths.REGISTER));
}

export function* loginOpen() {
  yield put(actions.loginOpen());
  yield put(replace(Paths.LOGIN));
}

export function* register(data) {
  yield put(actions.register(data));

  let accessToken;
  try {
    ({ item: accessToken } = yield call(api.register, data));
  } catch (error) {
    yield put(actions.register.failure(error));
    return;
  }

  yield call(setAccessToken, accessToken);
  yield put(actions.register.success(accessToken));
}

export function* clearRegisterError() {
  yield put(actions.clearRegisterError());
}

export default {
  authenticate,
  clearAuthenticateError,
  authenticateSso,
  authenticateSsoCallback,
  registerOpen,
  loginOpen,
  register,
  clearRegisterError,
};
