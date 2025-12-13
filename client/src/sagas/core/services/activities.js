import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import request from '../request';

export function* fetchActivitiesInCard(cardId) {
  const lastId = yield select(selectors.selectLastActivityIdByCardId, cardId);

  yield put(actions.fetchCardActivities(cardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getCardActivities, cardId, {
      beforeId: lastId,
      exceptComments: true,
    }));
  } catch (error) {
    yield put(actions.fetchCardActivities.failure(cardId, error));
    return;
  }

  yield put(actions.fetchCardActivities.success(cardId, activities, users));
}

export function* fetchActivitiesInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchActivitiesInCard, cardId);
}

export function* fetchActivitiesInList(listId) {
  const lastId = yield select(selectors.selectLastActivityIdByListId, listId);

  yield put(actions.fetchListActivities(listId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getListActivities, listId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchListActivities.failure(listId, error));
    return;
  }

  yield put(actions.fetchListActivities.success(listId, activities, users));
}

export function* fetchActivitiesInBoard(boardId) {
  const lastId = yield select(selectors.selectLastActivityIdByBoardId, boardId);

  yield put(actions.fetchBoardActivities(boardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getBoardActivities, boardId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchBoardActivities.failure(boardId, error));
    return;
  }

  yield put(actions.fetchBoardActivities.success(boardId, activities, users));
}

export function* fetchActivitiesInProject(projectId) {
  const lastId = yield select(selectors.selectLastActivityIdByProjectId, projectId);

  yield put(actions.fetchProjectActivities(projectId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getProjectActivities, projectId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchProjectActivities.failure(projectId, error));
    return;
  }

  yield put(actions.fetchProjectActivities.success(projectId, activities, users));
}

export function* handleActivityCreate(activity) {
  yield put(actions.handleActivityCreate(activity));
}

export function* handleActivityUpdate(activity) {
  yield put(actions.handleActivityUpdate(activity));
}

export function* handleActivityDelete(activity) {
  yield put(actions.handleActivityDelete(activity));
}

export default {
  fetchActivitiesInCard,
  fetchActivitiesInCurrentCard,
  fetchActivitiesInList,
  fetchActivitiesInBoard,
  fetchActivitiesInProject,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
