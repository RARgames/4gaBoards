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

export function* authenticateGoogleSso() {
  let googleSsoUrl;
  try {
    const response = yield call(api.getGoogleAuthUrl);
    googleSsoUrl = response.item.googleSsoUrl;
  } catch (error) {
    yield put(actions.authenticateGoogleSso.failure(error));
    return;
  }
  window.location.replace(googleSsoUrl);
}

export function* authenticateGoogleSsoCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  yield put(replace(Paths.LOGIN));
  if (accessToken !== null) {
    yield call(setAccessToken, accessToken);
    yield put(actions.authenticateGoogleSso.success(accessToken));
  }
}

export function* setGoogleLoginButton() {
  const { item: googleSsoEnabled } = yield call(api.getGoogleAuthUrl);
  yield put(actions.setGoogleLoginButton(googleSsoEnabled));
}

export function* clearAuthenticateError() {
  yield put(actions.clearAuthenticateError());
}

export default {
  setGoogleLoginButton,
  authenticate,
  authenticateGoogleSso,
  authenticateGoogleSsoCallback,
  clearAuthenticateError,
};
