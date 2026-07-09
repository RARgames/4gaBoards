import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* categoryTagsWatchers() {
  yield all([takeEvery(EntryActionTypes.CATEGORY_TAGS_FETCH, () => services.fetchCategoryTags()), takeEvery(EntryActionTypes.CATEGORY_TAG_CREATE, ({ payload: { data } }) => services.createCategoryTag(data))]);
}
