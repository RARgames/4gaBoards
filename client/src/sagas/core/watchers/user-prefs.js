import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* userPrefsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CURRENT_USER_PREFS_UPDATE, ({ payload: { data } }) => services.updateCurrentUserPrefs(data)),
    takeEvery(EntryActionTypes.USER_PREFS_UPDATE_HANDLE, ({ payload: { userPrefs } }) => services.handleUserPrefsUpdate(userPrefs)),
  ]);
}
