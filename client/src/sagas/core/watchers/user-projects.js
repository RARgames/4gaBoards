import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* userProjectsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.USER_PROJECT_UPDATE, ({ payload: { id, data } }) => services.updateUserProject(id, data)),
    takeEvery(EntryActionTypes.USER_PROJECT_UPDATE_HANDLE, ({ payload: { userProject } }) => services.handleUserProjectUpdate(userProject)),
  ]);
}
