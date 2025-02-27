import { put, call, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import request from '../request';
import { changeCoreLanguage } from './core';

export function* updateCurrentUserPrefs(data) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  const oldUserPrefs = yield select(selectors.selectCurrentUserPrefs);

  yield put(actions.updateUserPrefs(currentUserId, data));
  if ('language' in data) {
    yield call(changeCoreLanguage, data.language);
  }

  let userPrefs;
  try {
    ({ item: userPrefs } = yield call(request, api.updateUserPrefs, currentUserId, data));
  } catch (error) {
    yield put(actions.updateUserPrefs.failure(error, oldUserPrefs));
    return;
  }

  yield put(actions.updateUserPrefs.success(userPrefs));
}

export function* handleUserPrefsUpdate(userPrefs) {
  const oldUserPrefs = yield select(selectors.selectCurrentUserPrefs);
  if (userPrefs.language !== oldUserPrefs.language) {
    yield call(changeCoreLanguage, userPrefs.language);
  }

  yield put(actions.handleUserPrefsUpdate(userPrefs));
}

export default {
  updateCurrentUserPrefs,
  handleUserPrefsUpdate,
};
