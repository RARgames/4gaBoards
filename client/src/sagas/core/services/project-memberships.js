import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';
import { goToRoot } from './router';

export function* createMembershipInProject(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createProjectMembership({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let projectMembership;
  try {
    ({ item: projectMembership } = yield call(request, api.createProjectMembership, projectId, data));
  } catch (error) {
    yield put(actions.createProjectMembership.failure(localId, error));
    return;
  }

  yield put(actions.createProjectMembership.success(localId, projectMembership));
}

export function* handleProjectMembershipCreate(projectMembership) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  let project;
  let users;
  let projectManagers;
  let boards;
  let boardMemberships;
  let projectMemberships;

  if (projectMembership.userId === currentUserId) {
    const projectModel = yield select(selectors.selectProject, projectMembership.projectId);

    if (!projectModel) {
      try {
        ({
          item: project,
          included: { users, projectManagers, boards, boardMemberships, projectMemberships },
        } = yield call(request, api.getProject, projectMembership.projectId));
      } catch {} // eslint-disable-line no-empty
    }
  }

  yield put(actions.handleProjectMembershipCreate(projectMembership, project, users, projectManagers, boards, boardMemberships, projectMemberships));
}

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

export function* deleteProjectMembership(id) {
  let projectMembership = yield select(selectors.selectProjectMembershipById, id);

  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { projectId } = yield select(selectors.selectPath);

  if (projectMembership.userId === currentUserId && projectMembership.projectId === projectId) {
    yield call(goToRoot);
  }

  yield put(actions.deleteProjectMembership(id));

  try {
    ({ item: projectMembership } = yield call(request, api.deleteProjectMembership, id));
  } catch (error) {
    yield put(actions.deleteProjectMembership.failure(id, error, projectMembership));
    return;
  }

  yield put(actions.deleteProjectMembership.success(projectMembership));
}

export function* handleProjectMembershipDelete(projectMembership) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { projectId } = yield select(selectors.selectPath);

  if (projectMembership.userId === currentUserId && projectMembership.projectId === projectId) {
    yield call(goToRoot);
  }

  yield put(actions.handleProjectMembershipDelete(projectMembership));
}

export default {
  createMembershipInProject,
  handleProjectMembershipCreate,
  updateProjectMembership,
  handleProjectMembershipUpdate,
  deleteProjectMembership,
  handleProjectMembershipDelete,
};
