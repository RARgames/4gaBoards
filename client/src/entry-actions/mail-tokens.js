import EntryActionTypes from '../constants/EntryActionTypes';

const createMailToken = (data) => ({
  type: EntryActionTypes.MAIL_TOKEN_CREATE,
  payload: {
    data,
  },
});

const handleMailTokenCreate = (mailToken) => ({
  type: EntryActionTypes.MAIL_TOKEN_CREATE_HANDLE,
  payload: {
    mailToken,
  },
});

const updateMailToken = (id, data) => ({
  type: EntryActionTypes.MAIL_TOKEN_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleMailTokenUpdate = (mailToken) => ({
  type: EntryActionTypes.MAIL_TOKEN_UPDATE_HANDLE,
  payload: {
    mailToken,
  },
});

const deleteMailToken = (id) => ({
  type: EntryActionTypes.MAIL_TOKEN_DELETE,
  payload: {
    id,
  },
});

const handleMailTokenDelete = (mailToken) => ({
  type: EntryActionTypes.MAIL_TOKEN_DELETE_HANDLE,
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
