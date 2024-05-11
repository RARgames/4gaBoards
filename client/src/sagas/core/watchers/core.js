import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* coreWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CORE_INITIALIZE, () => services.initializeCore()),
    takeEvery(EntryActionTypes.LOGOUT, () => services.logout()),
    takeEvery(EntryActionTypes.CORE_SETTINGS_UPDATE, ({ payload: { data } }) => services.updateCoreSettings(data)),
    takeEvery(EntryActionTypes.CORE_SETTINGS_UPDATE_HANDLE, ({ payload: { data } }) => services.handleCoreSettingsUpdate(data)),
  ]);
}
