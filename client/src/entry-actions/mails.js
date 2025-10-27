import EntryActionTypes from '../constants/EntryActionTypes';

const createMail = (listId) => ({
  type: EntryActionTypes.MAIL_CREATE,
  payload: {
    listId,
  },
});

const handleMailCreate = (mail) => ({
  type: EntryActionTypes.MAIL_CREATE_HANDLE,
  payload: {
    mail,
  },
});

const updateMail = (listId) => ({
  type: EntryActionTypes.MAIL_UPDATE,
  payload: {
    listId,
  },
});

const handleUpdateMail = (mail) => ({
  type: EntryActionTypes.MAIL_UPDATE_HANDLE,
  payload: {
    mail,
  },
});

const deleteMail = (listId) => ({
  type: EntryActionTypes.MAIL_DELETE,
  payload: {
    listId,
  },
});

const handleMailDelete = (mail) => ({
  type: EntryActionTypes.MAIL_DELETE_HANDLE,
  payload: {
    mail,
  },
});

export default {
  createMail,
  handleMailCreate,
  updateMail,
  handleUpdateMail,
  deleteMail,
  handleMailDelete,
};
