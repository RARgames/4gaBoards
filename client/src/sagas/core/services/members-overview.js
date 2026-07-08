import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchMembersOverview() {
  yield put(actions.fetchMembersOverview());

  let items;
  try {
    ({ items } = yield call(request, api.getMembersOverview));
  } catch (error) {
    yield put(actions.fetchMembersOverview.failure(error));
    return;
  }

  yield put(actions.fetchMembersOverview.success(items));
}

export default {
  fetchMembersOverview,
};
