import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* mailsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.MAIL_CREATE, ({ payload: { listId } }) => services.createMail(listId)),
    takeEvery(EntryActionTypes.MAIL_CREATE_HANDLE, ({ payload: { mail } }) => services.handleMailCreate(mail)),
  ]);
}
