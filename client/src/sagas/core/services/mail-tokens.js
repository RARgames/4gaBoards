import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createMailToken(data) {
  yield put(actions.createMailToken(data));

  let mailToken;
  try {
    ({ item: mailToken } = yield call(request, api.createMailToken, data));
  } catch (error) {
    yield put(actions.createMailToken.failure(error));
    return;
  }

  yield put(actions.createMailToken.success(mailToken));
}

export function* handleMailTokenCreate(mailToken) {
  yield put(actions.handleMailTokenCreate(mailToken));
}

export function* updateMailToken(id, data) {
  yield put(actions.updateMailToken(id, data));

  let mailToken;
  try {
    ({ item: mailToken } = yield call(request, api.updateMailToken, id, data));
  } catch (error) {
    yield put(actions.updateMailToken.failure(id, error));
    return;
  }

  yield put(actions.updateMailToken.success(mailToken));
}

export function* handleMailTokenUpdate(mailToken) {
  yield put(actions.handleMailTokenUpdate(mailToken));
}

export function* deleteMailToken(id) {
  yield put(actions.deleteMailToken(id));

  let mailToken;
  try {
    ({ item: mailToken } = yield call(request, api.deleteMailToken, id));
  } catch (error) {
    yield put(actions.deleteMailToken.failure(id, error));
    return;
  }

  yield put(actions.deleteMailToken.success(mailToken));
}

export function* handleMailTokenDelete(mailToken) {
  yield put(actions.handleMailTokenDelete(mailToken));
}

export default {
  createMailToken,
  handleMailTokenCreate,
  updateMailToken,
  handleMailTokenUpdate,
  deleteMailToken,
  handleMailTokenDelete,
};
