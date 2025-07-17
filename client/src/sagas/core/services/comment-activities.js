import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import { ActivityTypes } from '../../../constants/Enums';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* fetchCommentActivitiesInCard(cardId) {
  const lastId = yield select(selectors.selectLastCommentActivityIdByCardId, cardId);

  yield put(actions.fetchCommentActivitiesCard(cardId));

  let activities;
  let users;

  try {
    ({
      items: activities,
      included: { users },
    } = yield call(request, api.getActivities, cardId, {
      beforeId: lastId,
      onlyComments: true,
    }));
  } catch (error) {
    yield put(actions.fetchCommentActivitiesCard.failure(cardId, error));
    return;
  }

  yield put(actions.fetchCommentActivitiesCard.success(cardId, activities, users));
}

export function* fetchCommentActivitiesInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchCommentActivitiesInCard, cardId);
}

export function* createCommentActivity(cardId, data) {
  const localId = yield call(createLocalId);
  const userId = yield select(selectors.selectCurrentUserId);

  yield put(
    actions.createCommentActivity({
      cardId,
      userId,
      data,
      id: localId,
      type: ActivityTypes.CARD_COMMENT,
    }),
  );

  let activity;
  try {
    ({ item: activity } = yield call(request, api.createCommentActivity, cardId, data));
  } catch (error) {
    yield put(actions.createCommentActivity.failure(localId, error));
    return;
  }

  yield put(actions.createCommentActivity.success(localId, activity));
}

export function* createCommentActivityInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createCommentActivity, cardId, data);
}

export function* updateCommentActivity(id, data) {
  yield put(actions.updateCommentActivity(id, data));

  let activity;
  try {
    ({ item: activity } = yield call(request, api.updateCommentActivity, id, data));
  } catch (error) {
    yield put(actions.updateCommentActivity.failure(id, error));
    return;
  }

  yield put(actions.updateCommentActivity.success(activity));
}

export function* deleteCommentActivity(id) {
  yield put(actions.deleteCommentActivity(id));

  let activity;
  try {
    ({ item: activity } = yield call(request, api.deleteCommentActivity, id));
  } catch (error) {
    yield put(actions.deleteCommentActivity.failure(id, error));
    return;
  }

  yield put(actions.deleteCommentActivity.success(activity));
}

export default {
  fetchCommentActivitiesInCard,
  fetchCommentActivitiesInCurrentCard,
  createCommentActivity,
  createCommentActivityInCurrentCard,
  updateCommentActivity,
  deleteCommentActivity,
};
