import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* documentsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.DOCUMENTS_FETCH, ({ payload: { projectId } }) => services.fetchDocuments(projectId)),
    takeEvery(EntryActionTypes.DOCUMENT_IN_PROJECT_CREATE, ({ payload: { projectId, data } }) => services.createDocumentInProject(projectId, data)),
    takeEvery(EntryActionTypes.DOCUMENT_CREATE_HANDLE, ({ payload: { document } }) => services.handleDocumentCreate(document)),
    takeEvery(EntryActionTypes.DOCUMENT_UPDATE, ({ payload: { id, data } }) => services.updateDocument(id, data)),
    takeEvery(EntryActionTypes.DOCUMENT_UPDATE_HANDLE, ({ payload: { document } }) => services.handleDocumentUpdate(document)),
    takeEvery(EntryActionTypes.DOCUMENT_DELETE, ({ payload: { id } }) => services.deleteDocument(id)),
    takeEvery(EntryActionTypes.DOCUMENT_DELETE_HANDLE, ({ payload: { document } }) => services.handleDocumentDelete(document)),
  ]);
}
