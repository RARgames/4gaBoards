import { all, takeEvery } from 'redux-saga/effects';

import services from '../services';
import EntryActionTypes from '../../../constants/EntryActionTypes';

export default function* loginWatchers() {
  yield all([
    takeEvery(EntryActionTypes.AUTHENTICATE, ({ payload: { data } }) => services.authenticate(data)),
    takeEvery(EntryActionTypes.AUTHENTICATE_GOOGLE_SSO, () => services.authenticateGoogleSso()),
    takeEvery(EntryActionTypes.AUTHENTICATE_ERROR_CLEAR, () => services.clearAuthenticateError()),
    takeEvery(EntryActionTypes.REGISTER_OPEN, () => services.registerOpen()),
    takeEvery(EntryActionTypes.LOGIN_OPEN, () => services.loginOpen()),
    takeEvery(EntryActionTypes.REGISTER, ({ payload: { data } }) => services.register(data)),
    takeEvery(EntryActionTypes.REGISTER_ERROR_CLEAR, () => services.clearRegisterError()),
  ]);
}
