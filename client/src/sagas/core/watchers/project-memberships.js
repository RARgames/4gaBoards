import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* projectMembershipsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE, ({ payload: { id, data } }) => services.updateProjectMembership(id, data)),
    takeEvery(EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE_HANDLE, ({ payload: { projectMembership } }) => services.handleProjectMembershipUpdate(projectMembership)),
  ]);
}
