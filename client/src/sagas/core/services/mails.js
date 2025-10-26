import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* createMail(listId) {
  yield put(actions.createMail(listId));

  let mail;
  try {
    ({ item: mail } = yield call(request, api.createMail, listId));
  } catch (error) {
    yield put(actions.createMail.failure(listId, error));
    return;
  }

  yield put(actions.createMail.success(listId, mail));
}

export function* handleMailCreate(mail) {
  yield put(actions.handleMailCreate(mail));
}

export function* updateMail(listId) {
  yield put(actions.updateMail(listId));

  let mail;
  try {
    ({ item: mail } = yield call(request, api.updateMail, listId));
  } catch (error) {
    yield put(actions.updateMail.failure(listId, error));
    return;
  }

  yield put(actions.updateMail.success(listId, mail));
}

export function* handleMailUpdate(mail) {
  yield put(actions.handleMailUpdate(mail));
}

export default {
  createMail,
  handleMailCreate,
  updateMail,
  handleMailUpdate,
};
