import { put, call } from 'redux-saga/effects';

import request from '../request';
import actions from '../../../actions';
import api from '../../../api';

export function* updateUserProject(id, data) {
  yield put(actions.updateUserProject(id, data));
  let userProject;
  try {
    ({ item: userProject } = yield call(request, api.updateUserProject, id, data));
  } catch (error) {
    yield put(actions.updateUserProject.failure(id, error));
    return;
  }

  yield put(actions.updateUserProject.success(userProject));
}

export function* handleUserProjectUpdate(userProject) {
  yield put(actions.handleUserProjectUpdate(userProject));
}

export default {
  updateUserProject,
  handleUserProjectUpdate,
};
