import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* mediaWatchers() {
  yield all([takeEvery(EntryActionTypes.MEDIA_FETCH, ({ payload: { projectId } }) => services.fetchMedia(projectId))]);
}
