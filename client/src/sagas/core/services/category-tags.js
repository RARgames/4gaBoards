import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchCategoryTags() {
  yield put(actions.fetchCategoryTags());

  let items;
  try {
    ({ items } = yield call(request, api.getCategoryTags));
  } catch (error) {
    yield put(actions.fetchCategoryTags.failure(error));
    return;
  }

  yield put(actions.fetchCategoryTags.success(items));
}

export function* createCategoryTag(data) {
  yield put(actions.createCategoryTag());

  let item;
  try {
    ({ item } = yield call(request, api.createCategoryTag, data));
  } catch (error) {
    yield put(actions.createCategoryTag.failure(error));
    return;
  }

  yield put(actions.createCategoryTag.success(item));
}

export default {
  fetchCategoryTags,
  createCategoryTag,
};
