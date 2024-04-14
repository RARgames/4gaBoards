import { call, put } from 'redux-saga/effects';
import { replace } from '../../../lib/redux-router';
import actions from '../../../actions';
import api from '../../../api';
import { setAccessToken } from '../../../utils/access-token-storage';
import Paths from '../../../constants/Paths';

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

// eslint-disable-next-line require-yield
export function* authenticateGoogleSso() {
  let googleSsoUrl;
  try {
    const response = yield call(api.getGoogleAuthUrl);
    googleSsoUrl = response.item.googleSsoUrl.url;
  } catch (error) {
    yield put(actions.authenticate.failure(error));
    return;
  }
  window.location.replace(googleSsoUrl);
}

export function* authenticateGoogleSsoCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('accessToken');
  yield put(replace(Paths.LOGIN));
  if (code !== null) {
    yield call(setAccessToken, code);
    yield put(actions.authenticateGoogleSso.success(code));
  }
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export default {
  authenticate,
  authenticateGoogleSso,
  authenticateGoogleSsoCallback,
  clearAuthenticateError,
};
