import ActionTypes from '../constants/ActionTypes';

const createMailToken = (data) => ({
  type: ActionTypes.MAIL_TOKEN_CREATE,
  payload: {
    data,
  },
});

createMailToken.success = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_CREATE__SUCCESS,
  payload: {
    mailToken,
  },
});

createMailToken.failure = (error) => ({
  type: ActionTypes.MAIL_TOKEN_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleMailTokenCreate = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_CREATE_HANDLE,
  payload: {
    mailToken,
  },
});

const updateMailToken = (id, data) => ({
  type: ActionTypes.MAIL_TOKEN_UPDATE,
  payload: {
    id,
    data,
  },
});

updateMailToken.success = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_UPDATE__SUCCESS,
  payload: {
    mailToken,
  },
});

updateMailToken.failure = (id, error) => ({
  type: ActionTypes.MAIL_TOKEN_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleMailTokenUpdate = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_UPDATE_HANDLE,
  payload: {
    mailToken,
  },
});

const deleteMailToken = (id) => ({
  type: ActionTypes.MAIL_TOKEN_DELETE,
  payload: {
    id,
  },
});

deleteMailToken.success = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_DELETE__SUCCESS,
  payload: {
    mailToken,
  },
});

deleteMailToken.failure = (id, error) => ({
  type: ActionTypes.MAIL_TOKEN_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleMailTokenDelete = (mailToken) => ({
  type: ActionTypes.MAIL_TOKEN_DELETE_HANDLE,
  payload: {
    mailToken,
  },
});

export default {
  createMailToken,
  handleMailTokenCreate,
  updateMailToken,
  handleMailTokenUpdate,
  deleteMailToken,
  handleMailTokenDelete,
};
