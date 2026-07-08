import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchMedia(projectId) {
  yield put(actions.fetchMedia());

  let documents;
  let attachments;
  try {
    ({ documents, attachments } = yield call(request, api.getMedia, projectId));
  } catch (error) {
    yield put(actions.fetchMedia.failure(error));
    return;
  }

  yield put(actions.fetchMedia.success(documents, attachments));
}

export default {
  fetchMedia,
};
