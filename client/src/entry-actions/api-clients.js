import EntryActionTypes from '../constants/EntryActionTypes';

const createApiClient = (data) => ({
  type: EntryActionTypes.API_CLIENT_CREATE,
  payload: {
    data,
  },
});

const handleApiClientCreate = (apiClient) => ({
  type: EntryActionTypes.API_CLIENT_CREATE_HANDLE,
  payload: {
    apiClient,
  },
});

const updateApiClient = (id, data) => ({
  type: EntryActionTypes.API_CLIENT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleApiClientUpdate = (apiClient) => ({
  type: EntryActionTypes.API_CLIENT_UPDATE_HANDLE,
  payload: {
    apiClient,
  },
});

const deleteApiClient = (id) => ({
  type: EntryActionTypes.API_CLIENT_DELETE,
  payload: {
    id,
  },
});

const handleApiClientDelete = (apiClient) => ({
  type: EntryActionTypes.API_CLIENT_DELETE_HANDLE,
  payload: {
    apiClient,
  },
});

export default {
  createApiClient,
  handleApiClientCreate,
  updateApiClient,
  handleApiClientUpdate,
  deleteApiClient,
  handleApiClientDelete,
};
