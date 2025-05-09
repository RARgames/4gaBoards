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

export function* authenticateGoogleSso() {
  const { googleSsoUrl } = yield select(selectors.selectCoreSettings);
  window.location.replace(googleSsoUrl);
}

export function* authenticateGoogleSsoCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const err = params.get('error');
  yield put(replace(Paths.LOGIN));

  if (err !== null) {
    yield put(actions.authenticateGoogleSso.failure({ code: 'E_UNAUTHORIZED', message: err }));
    return;
  }
  if (accessToken !== null) {
    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateGoogleSso.success(accessToken));
  } else {
    yield put(actions.authenticateGoogleSso.failure({ code: 'E_UNAUTHORIZED', message: 'Unknown error' }));
  }
}

export function* authenticateGithubSso() {
  const { githubSsoUrl } = yield select(selectors.selectCoreSettings);
  window.location.replace(githubSsoUrl);
}

export function* authenticateGithubSsoCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const err = params.get('error');
  yield put(replace(Paths.LOGIN));

  if (err !== null) {
    yield put(actions.authenticateGithubSso.failure({ code: 'E_UNAUTHORIZED', message: err }));
    return;
  }
  if (accessToken !== null) {
    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateGithubSso.success(accessToken));
  } else {
    yield put(actions.authenticateGithubSso.failure({ code: 'E_UNAUTHORIZED', message: 'Unknown error' }));
  }
}

export function* authenticateMicrosoftSso() {
  const { microsoftSsoUrl } = yield select(selectors.selectCoreSettings);
  window.location.replace(microsoftSsoUrl);
}

export function* authenticateMicrosoftSsoCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const err = params.get('error');
  yield put(replace(Paths.LOGIN));

  if (err !== null) {
    yield put(actions.authenticateMicrosoftSso.failure({ code: 'E_UNAUTHORIZED', message: err }));
    return;
  }
  if (accessToken !== null) {
    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateMicrosoftSso.success(accessToken));
  } else {
    yield put(actions.authenticateMicrosoftSso.failure({ code: 'E_UNAUTHORIZED', message: 'Unknown error' }));
  }
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
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
  authenticateGoogleSso,
  authenticateGoogleSsoCallback,
  authenticateGithubSso,
  authenticateGithubSsoCallback,
  authenticateMicrosoftSso,
  authenticateMicrosoftSsoCallback,
  clearAuthenticateError,
  registerOpen,
  loginOpen,
  register,
  clearRegisterError,
};
