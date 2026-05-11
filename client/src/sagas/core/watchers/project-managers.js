import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* projectManagersWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MANAGER_IN_CURRENT_PROJECT_CREATE, ({ payload: { data } }) => services.createManagerInCurrentProject(data)),
    takeEvery(EntryActionTypes.MANAGER_IN_PROJECT_CREATE, ({ payload: { id, data } }) => services.createProjectManager(id, data)),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_CREATE_HANDLE, ({ payload: { projectManager } }) => services.handleProjectManagerCreate(projectManager)),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE, ({ payload: { id } }) => services.deleteProjectManager(id)),
    takeEvery(EntryActionTypes.PROJECT_MANAGER_DELETE_HANDLE, ({ payload: { projectManager } }) => services.handleProjectManagerDelete(projectManager)),
  ]);
}
