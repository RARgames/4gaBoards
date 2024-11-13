import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* projectsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_CREATE, ({ payload: { data } }) => services.createProject(data)),
    takeEvery(EntryActionTypes.PROJECT_CREATE_HANDLE, ({ payload: { project } }) => services.handleProjectCreate(project)),
    takeEvery(EntryActionTypes.PROJECT_UPDATE, ({ payload: { id, data } }) => services.updateProject(id, data)),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_UPDATE, ({ payload: { data } }) => services.updateCurrentProject(data)),
    takeEvery(EntryActionTypes.PROJECT_UPDATE_HANDLE, ({ payload: { project } }) => services.handleProjectUpdate(project)),
    takeEvery(EntryActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE, ({ payload: { id, data } }) => services.updateProjectBackgroundImage(id, data)),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_BACKGROUND_IMAGE_UPDATE, ({ payload: { data } }) => services.updateCurrentProjectBackgroundImage(data)),
    takeEvery(EntryActionTypes.PROJECT_DELETE, ({ payload: { id } }) => services.deleteProject(id)),
    takeEvery(EntryActionTypes.CURRENT_PROJECT_DELETE, () => services.deleteCurrentProject()),
    takeEvery(EntryActionTypes.PROJECT_DELETE_HANDLE, ({ payload: { project } }) => services.handleProjectDelete(project)),
    takeEvery(EntryActionTypes.PROJECT_IMPORT_GETTING_STARTED, ({ payload: { data } }) => services.importGettingStartedProject(data)),
  ]);
}
