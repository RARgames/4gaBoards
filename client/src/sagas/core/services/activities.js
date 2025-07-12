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
    } = yield call(request, api.getActivities, cardId, {
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
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
