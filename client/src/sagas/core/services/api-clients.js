import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import request from '../request';

export function* createApiClient(data) {
  const currentUser = yield select(selectors.selectCurrentUser);
  yield put(actions.createApiClient(data, currentUser.id));

  let apiClient;
  try {
    ({ item: apiClient } = yield call(request, api.createApiClient, data));
  } catch (error) {
    yield put(actions.createApiClient.failure(error, currentUser.id));
    return;
  }

  yield put(actions.createApiClient.success(apiClient));
}

export function* handleApiClientCreate(apiClient) {
  yield put(actions.handleApiClientCreate(apiClient));
}

export function* updateApiClient(id, data) {
  const currentUser = yield select(selectors.selectCurrentUser);
  yield put(actions.updateApiClient(id, data, currentUser.id));

  let apiClient;
  try {
    ({ item: apiClient } = yield call(request, api.updateApiClient, id, data));
  } catch (error) {
    yield put(actions.updateApiClient.failure(id, error, currentUser.id));
    return;
  }

  yield put(actions.updateApiClient.success(apiClient));
}

export function* handleApiClientUpdate(apiClient) {
  yield put(actions.handleApiClientUpdate(apiClient));
}

export function* deleteApiClient(id) {
  yield put(actions.deleteApiClient(id));

  let apiClient;
  try {
    ({ item: apiClient } = yield call(request, api.deleteApiClient, id));
  } catch (error) {
    yield put(actions.deleteApiClient.failure(id, error));
    return;
  }

  yield put(actions.deleteApiClient.success(apiClient));
}

export function* handleApiClientDelete(apiClient) {
  yield put(actions.handleApiClientDelete(apiClient));
}

export default {
  createApiClient,
  handleApiClientCreate,
  updateApiClient,
  handleApiClientUpdate,
  deleteApiClient,
  handleApiClientDelete,
};
