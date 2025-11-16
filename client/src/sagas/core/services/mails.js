import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createMail({ listId, boardId }) {
  yield put(actions.createMail({ listId, boardId }));

  let mail;
  try {
    ({ item: mail } = yield call(request, api.createMail, { listId, boardId }));
  } catch (error) {
    yield put(actions.createMail.failure({ listId, boardId }, error));
    return;
  }

  yield put(actions.createMail.success({ listId, boardId }, mail));
}

export function* handleMailCreate(mail) {
  yield put(actions.handleMailCreate(mail));
}

export function* updateMail({ listId, boardId }) {
  yield put(actions.updateMail({ listId, boardId }));

  let mail;
  try {
    ({ item: mail } = yield call(request, api.updateMail, { listId, boardId }));
  } catch (error) {
    yield put(actions.updateMail.failure({ listId, boardId }, error));
    return;
  }

  yield put(actions.updateMail.success({ listId, boardId }, mail));
}

export function* handleMailUpdate(mail) {
  yield put(actions.handleMailUpdate(mail));
}

export function* deleteMail(mailId) {
  yield put(actions.deleteMail(mailId));

  let mail;
  try {
    ({ item: mail } = yield call(request, api.deleteMail, mailId));
  } catch (error) {
    yield put(actions.deleteMail.failure(mailId, error));
    return;
  }

  yield put(actions.deleteMail.success(mailId, mail));
}

export function* handleMailDelete(mail) {
  yield put(actions.handleMailDelete(mail));
}

export default {
  createMail,
  handleMailCreate,
  updateMail,
  handleMailUpdate,
  deleteMail,
  handleMailDelete,
};
