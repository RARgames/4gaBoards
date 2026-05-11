import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import request from '../request';

export function* fetchAttachmentActivities(attachmentId) {
  const lastId = yield select(selectors.selectLastAttachmentActivityIdById, attachmentId);

  yield put(actions.fetchAttachmentActivities(attachmentId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getAttachmentActivities, attachmentId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchAttachmentActivities.failure(attachmentId, error));
    return;
  }

  yield put(actions.fetchAttachmentActivities.success(attachmentId, activities, users));
}

export function* fetchCommentActivities(commentId) {
  const lastId = yield select(selectors.selectLastCommentActivityIdById, commentId);

  yield put(actions.fetchCommentActivities(commentId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getCommentActivities, commentId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchCommentActivities.failure(commentId, error));
    return;
  }

  yield put(actions.fetchCommentActivities.success(commentId, activities, users));
}

export function* fetchTaskActivities(taskId) {
  const lastId = yield select(selectors.selectLastTaskActivityIdById, taskId);

  yield put(actions.fetchTaskActivities(taskId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getTaskActivities, taskId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchTaskActivities.failure(taskId, error));
    return;
  }

  yield put(actions.fetchTaskActivities.success(taskId, activities, users));
}

export function* fetchCardActivities(cardId) {
  const lastId = yield select(selectors.selectLastCardActivityIdById, cardId);

  yield put(actions.fetchCardActivities(cardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getCardActivities, cardId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchCardActivities.failure(cardId, error));
    return;
  }

  yield put(actions.fetchCardActivities.success(cardId, activities, users));
}

export function* fetchActivitiesInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchCardActivities, cardId);
}

export function* fetchListActivities(listId) {
  const lastId = yield select(selectors.selectLastListActivityIdById, listId);

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

export function* fetchBoardActivities(boardId) {
  const lastId = yield select(selectors.selectLastBoardActivityIdById, boardId);

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

export function* fetchProjectActivities(projectId) {
  const lastId = yield select(selectors.selectLastProjectActivityIdById, projectId);

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

export function* fetchUserActivities(userId) {
  const lastId = yield select(selectors.selectLastUserActivityIdById, userId);

  yield put(actions.fetchUserActivities(userId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getUserActivities, userId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchUserActivities.failure(userId, error));
    return;
  }

  yield put(actions.fetchUserActivities.success(userId, activities, users));
}

export function* fetchUserAccountActivities(userAccountId) {
  const lastId = yield select(selectors.selectLastUserAccountActivityIdById, userAccountId);

  yield put(actions.fetchUserAccountActivities(userAccountId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getUserAccountActivities, userAccountId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchUserAccountActivities.failure(userAccountId, error));
    return;
  }

  yield put(actions.fetchUserAccountActivities.success(userAccountId, activities, users));
}

export function* fetchInstanceActivities() {
  const lastId = yield select(selectors.selectLastInstanceActivityId);

  yield put(actions.fetchInstanceActivities());

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getInstanceActivities, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchInstanceActivities.failure(error));
    return;
  }

  yield put(actions.fetchInstanceActivities.success(activities, users));
}

export function* handleActivityCreate(activity) {
  yield put(actions.handleActivityCreate(activity));
}

export default {
  fetchAttachmentActivities,
  fetchCommentActivities,
  fetchTaskActivities,
  fetchCardActivities,
  fetchActivitiesInCurrentCard,
  fetchListActivities,
  fetchBoardActivities,
  fetchProjectActivities,
  fetchUserActivities,
  fetchUserAccountActivities,
  fetchInstanceActivities,
  handleActivityCreate,
};
