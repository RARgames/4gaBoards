import { call, put, select } from 'redux-saga/effects';

import requests from '../requests';
import selectors from '../../../selectors';
import actions from '../../../actions';

export function* handleSocketDisconnect() {
  yield put(actions.handleSocketDisconnect());
}

export function* handleSocketReconnect() {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const { boardId } = yield select(selectors.selectPath);

  yield put(actions.handleSocketReconnect.fetchCore(currentUserId, boardId));
  const {
    user,
    board,
    users,
    projects,
    projectManagers,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    core,
    cardMemberships,
    cardLabels,
    tasks,
    taskMemberships,
    attachments,
    activities,
    notifications,
    userProjects,
  } = yield call(requests.fetchCore); // TODO: handle error
  yield put(
    actions.handleSocketReconnect(
      user,
      board,
      users,
      projects,
      projectManagers,
      boards,
      boardMemberships,
      labels,
      lists,
      cards,
      core,
      cardMemberships,
      cardLabels,
      tasks,
      taskMemberships,
      attachments,
      activities,
      notifications,
      userProjects,
    ),
  );
}

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
