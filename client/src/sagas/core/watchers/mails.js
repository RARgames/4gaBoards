import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* mailsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MAIL_CREATE, ({ payload }) => services.createMail(payload)),
    takeEvery(EntryActionTypes.MAIL_CREATE_HANDLE, ({ payload: { mail } }) => services.handleMailCreate(mail)),
    takeEvery(EntryActionTypes.MAIL_UPDATE, ({ payload }) => services.updateMail(payload)),
    takeEvery(EntryActionTypes.MAIL_UPDATE_HANDLE, ({ payload: { mail } }) => services.handleMailUpdate(mail)),
    takeEvery(EntryActionTypes.MAIL_DELETE, ({ payload: { mailId } }) => services.deleteMail(mailId)),
    takeEvery(EntryActionTypes.MAIL_DELETE_HANDLE, ({ payload: { mail } }) => services.handleMailDelete(mail)),
  ]);
}
