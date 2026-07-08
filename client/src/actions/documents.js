import ActionTypes from '../constants/ActionTypes';

const fetchDocuments = (projectId) => ({
  type: ActionTypes.DOCUMENTS_FETCH,
  payload: {
    projectId,
  },
});

fetchDocuments.success = (projectId, documents) => ({
  type: ActionTypes.DOCUMENTS_FETCH__SUCCESS,
  payload: {
    projectId,
    documents,
  },
});

fetchDocuments.failure = (projectId, error) => ({
  type: ActionTypes.DOCUMENTS_FETCH__FAILURE,
  payload: {
    projectId,
    error,
  },
});

const createDocument = (document) => ({
  type: ActionTypes.DOCUMENT_CREATE,
  payload: {
    document,
  },
});

createDocument.success = (localId, document) => ({
  type: ActionTypes.DOCUMENT_CREATE__SUCCESS,
  payload: {
    localId,
    document,
  },
});

createDocument.failure = (localId, error) => ({
  type: ActionTypes.DOCUMENT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleDocumentCreate = (document) => ({
  type: ActionTypes.DOCUMENT_CREATE_HANDLE,
  payload: {
    document,
  },
});

const updateDocument = (id, data) => ({
  type: ActionTypes.DOCUMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateDocument.success = (document) => ({
  type: ActionTypes.DOCUMENT_UPDATE__SUCCESS,
  payload: {
    document,
  },
});

updateDocument.failure = (id, error) => ({
  type: ActionTypes.DOCUMENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleDocumentUpdate = (document) => ({
  type: ActionTypes.DOCUMENT_UPDATE_HANDLE,
  payload: {
    document,
  },
});

const deleteDocument = (id) => ({
  type: ActionTypes.DOCUMENT_DELETE,
  payload: {
    id,
  },
});

deleteDocument.success = (document) => ({
  type: ActionTypes.DOCUMENT_DELETE__SUCCESS,
  payload: {
    document,
  },
});

deleteDocument.failure = (id, error, document) => ({
  type: ActionTypes.DOCUMENT_DELETE__FAILURE,
  payload: {
    id,
    error,
    document,
  },
});

const handleDocumentDelete = (document) => ({
  type: ActionTypes.DOCUMENT_DELETE_HANDLE,
  payload: {
    document,
  },
});

export default {
  fetchDocuments,
  createDocument,
  handleDocumentCreate,
  updateDocument,
  handleDocumentUpdate,
  deleteDocument,
  handleDocumentDelete,
};
