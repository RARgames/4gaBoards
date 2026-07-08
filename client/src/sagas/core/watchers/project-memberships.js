import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* projectMembershipsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MEMBERSHIP_IN_PROJECT_CREATE, ({ payload: { id, data } }) => services.createMembershipInProject(id, data)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_CREATE_HANDLE, ({ payload: { projectMembership } }) => services.handleProjectMembershipCreate(projectMembership)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE, ({ payload: { id, data } }) => services.updateProjectMembership(id, data)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE_HANDLE, ({ payload: { projectMembership } }) => services.handleProjectMembershipUpdate(projectMembership)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_DELETE, ({ payload: { id } }) => services.deleteProjectMembership(id)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_DELETE_HANDLE, ({ payload: { projectMembership } }) => services.handleProjectMembershipDelete(projectMembership)),
  ]);
}
