import EntryActionTypes from '../constants/EntryActionTypes';

const createMail = ({ listId, boardId }) => ({
  type: EntryActionTypes.MAIL_CREATE,
  payload: {
    listId,
    boardId,
  },
});

const handleMailCreate = (mail) => ({
  type: EntryActionTypes.MAIL_CREATE_HANDLE,
  payload: {
    mail,
  },
});

const updateMail = ({ listId, boardId }) => ({
  type: EntryActionTypes.MAIL_UPDATE,
  payload: {
    listId,
    boardId,
  },
});

const handleMailUpdate = (mail) => ({
  type: EntryActionTypes.MAIL_UPDATE_HANDLE,
  payload: {
    mail,
  },
});

const deleteMail = (mailId) => ({
  type: EntryActionTypes.MAIL_DELETE,
  payload: {
    mailId,
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
  handleMailUpdate,
  deleteMail,
  handleMailDelete,
};
