import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* mailsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MAIL_CREATE, ({ payload: { listId } }) => services.createMail(listId)),
    takeEvery(EntryActionTypes.MAIL_CREATE_HANDLE, ({ payload: { mail } }) => services.handleMailCreate(mail)),
    takeEvery(EntryActionTypes.MAIL_UPDATE, ({ payload: { listId } }) => services.updateMail(listId)),
    takeEvery(EntryActionTypes.MAIL_UPDATE_HANDLE, ({ payload: { mail } }) => services.handleMailUpdate(mail)),
  ]);
}
