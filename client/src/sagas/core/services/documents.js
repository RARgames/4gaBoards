import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* fetchDocuments(projectId) {
  yield put(actions.fetchDocuments(projectId));

  let documents;
  try {
    ({ items: documents } = yield call(request, api.getDocuments, projectId));
  } catch (error) {
    yield put(actions.fetchDocuments.failure(projectId, error));
    return;
  }

  yield put(actions.fetchDocuments.success(projectId, documents));
}

export function* createDocumentInProject(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createDocument({
      ...data,
      projectId,
      id: localId,
      name: data.name || data.file.name,
    }),
  );

  let document;
  try {
    ({ item: document } = yield call(request, api.createDocument, projectId, data));
  } catch (error) {
    yield put(actions.createDocument.failure(localId, error));
    return;
  }

  yield put(actions.createDocument.success(localId, document));
}

export function* handleDocumentCreate(document) {
  yield put(actions.handleDocumentCreate(document));
}

export function* updateDocument(id, data) {
  yield put(actions.updateDocument(id, data));

  let document;
  try {
    ({ item: document } = yield call(request, api.updateDocument, id, data));
  } catch (error) {
    yield put(actions.updateDocument.failure(id, error));
    return;
  }

  yield put(actions.updateDocument.success(document));
}

export function* handleDocumentUpdate(document) {
  yield put(actions.handleDocumentUpdate(document));
}

export function* deleteDocument(id) {
  const documentBeforeDelete = yield select(selectors.selectDocumentById, id);

  yield put(actions.deleteDocument(id));

  let document;
  try {
    ({ item: document } = yield call(request, api.deleteDocument, id));
  } catch (error) {
    yield put(actions.deleteDocument.failure(id, error, documentBeforeDelete));
    return;
  }

  yield put(actions.deleteDocument.success(document));
}

export function* handleDocumentDelete(document) {
  yield put(actions.handleDocumentDelete(document));
}

export default {
  fetchDocuments,
  createDocumentInProject,
  handleDocumentCreate,
  updateDocument,
  handleDocumentUpdate,
  deleteDocument,
  handleDocumentDelete,
};
