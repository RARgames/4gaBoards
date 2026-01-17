import { put, call } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* updateProjectMembership(id, data) {
  yield put(actions.updateProjectMembership(id, data));
  let projectMembership;
  try {
    ({ item: projectMembership } = yield call(request, api.updateProjectMembership, id, data));
  } catch (error) {
    yield put(actions.updateProjectMembership.failure(id, error));
    return;
  }

  yield put(actions.updateProjectMembership.success(projectMembership));
}

export function* handleProjectMembershipUpdate(projectMembership) {
  yield put(actions.handleProjectMembershipUpdate(projectMembership));
}

export default {
  updateProjectMembership,
  handleProjectMembershipUpdate,
};
