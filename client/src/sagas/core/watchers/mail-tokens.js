import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* mailTokensWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MAIL_TOKEN_CREATE, ({ payload: { data } }) => services.createMailToken(data)),
    takeEvery(EntryActionTypes.MAIL_TOKEN_CREATE_HANDLE, ({ payload: { mailToken } }) => services.handleMailTokenCreate(mailToken)),
    takeEvery(EntryActionTypes.MAIL_TOKEN_UPDATE, ({ payload: { id, data } }) => services.updateMailToken(id, data)),
    takeEvery(EntryActionTypes.MAIL_TOKEN_UPDATE_HANDLE, ({ payload: { mailToken } }) => services.handleMailTokenUpdate(mailToken)),
    takeEvery(EntryActionTypes.MAIL_TOKEN_DELETE, ({ payload: { id } }) => services.deleteMailToken(id)),
    takeEvery(EntryActionTypes.MAIL_TOKEN_DELETE_HANDLE, ({ payload: { mailToken } }) => services.handleMailTokenDelete(mailToken)),
  ]);
}
