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

export default {
  createMail,
  handleMailCreate,
};
