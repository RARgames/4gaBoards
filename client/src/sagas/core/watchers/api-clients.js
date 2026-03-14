import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* apiClientsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.API_CLIENT_CREATE, ({ payload: { data } }) => services.createApiClient(data)),
    takeEvery(EntryActionTypes.API_CLIENT_CREATE_HANDLE, ({ payload: { apiClient } }) => services.handleApiClientCreate(apiClient)),
    takeEvery(EntryActionTypes.API_CLIENT_UPDATE, ({ payload: { id, data } }) => services.updateApiClient(id, data)),
    takeEvery(EntryActionTypes.API_CLIENT_UPDATE_HANDLE, ({ payload: { apiClient } }) => services.handleApiClientUpdate(apiClient)),
    takeEvery(EntryActionTypes.API_CLIENT_DELETE, ({ payload: { id } }) => services.deleteApiClient(id)),
    takeEvery(EntryActionTypes.API_CLIENT_DELETE_HANDLE, ({ payload: { apiClient } }) => services.handleApiClientDelete(apiClient)),
  ]);
}
