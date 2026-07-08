import EntryActionTypes from '../constants/EntryActionTypes';

const fetchDocuments = (projectId) => ({
  type: EntryActionTypes.DOCUMENTS_FETCH,
  payload: {
    projectId,
  },
});

const createDocumentInProject = (projectId, data) => ({
  type: EntryActionTypes.DOCUMENT_IN_PROJECT_CREATE,
  payload: {
    projectId,
    data,
  },
});

const handleDocumentCreate = (document) => ({
  type: EntryActionTypes.DOCUMENT_CREATE_HANDLE,
  payload: {
    document,
  },
});

const updateDocument = (id, data) => ({
  type: EntryActionTypes.DOCUMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleDocumentUpdate = (document) => ({
  type: EntryActionTypes.DOCUMENT_UPDATE_HANDLE,
  payload: {
    document,
  },
});

const deleteDocument = (id) => ({
  type: EntryActionTypes.DOCUMENT_DELETE,
  payload: {
    id,
  },
});

const handleDocumentDelete = (document) => ({
  type: EntryActionTypes.DOCUMENT_DELETE_HANDLE,
  payload: {
    document,
  },
});

export default {
  fetchDocuments,
  createDocumentInProject,
  handleDocumentCreate,
  updateDocument,
  handleDocumentUpdate,
  deleteDocument,
  handleDocumentDelete,
};
