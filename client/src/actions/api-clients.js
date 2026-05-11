import ActionTypes from '../constants/ActionTypes';

const createApiClient = (data, userId) => ({
  type: ActionTypes.API_CLIENT_CREATE,
  payload: {
    data,
    userId,
  },
});

createApiClient.success = (apiClient) => ({
  type: ActionTypes.API_CLIENT_CREATE__SUCCESS,
  payload: {
    apiClient,
  },
});

createApiClient.failure = (error, userId) => ({
  type: ActionTypes.API_CLIENT_CREATE__FAILURE,
  payload: {
    error,
    userId,
  },
});

const handleApiClientCreate = (apiClient) => ({
  type: ActionTypes.API_CLIENT_CREATE_HANDLE,
  payload: {
    apiClient,
  },
});

const updateApiClient = (id, data, userId) => ({
  type: ActionTypes.API_CLIENT_UPDATE,
  payload: {
    id,
    data,
    userId,
  },
});

updateApiClient.success = (apiClient) => ({
  type: ActionTypes.API_CLIENT_UPDATE__SUCCESS,
  payload: {
    apiClient,
  },
});

updateApiClient.failure = (id, error, userId) => ({
  type: ActionTypes.API_CLIENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
    userId,
  },
});

const handleApiClientUpdate = (apiClient) => ({
  type: ActionTypes.API_CLIENT_UPDATE_HANDLE,
  payload: {
    apiClient,
  },
});

const deleteApiClient = (id) => ({
  type: ActionTypes.API_CLIENT_DELETE,
  payload: {
    id,
  },
});

deleteApiClient.success = (apiClient) => ({
  type: ActionTypes.API_CLIENT_DELETE__SUCCESS,
  payload: {
    apiClient,
  },
});

deleteApiClient.failure = (id, error) => ({
  type: ActionTypes.API_CLIENT_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleApiClientDelete = (apiClient) => ({
  type: ActionTypes.API_CLIENT_DELETE_HANDLE,
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
