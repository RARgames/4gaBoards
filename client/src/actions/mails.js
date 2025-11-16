import ActionTypes from '../constants/ActionTypes';

const createMail = ({ listId, boardId }) => ({
  type: ActionTypes.MAIL_CREATE,
  payload: {
    listId,
    boardId,
  },
});

createMail.success = ({ listId, boardId }, mail) => ({
  type: ActionTypes.MAIL_CREATE__SUCCESS,
  payload: {
    listId,
    boardId,
    mail,
  },
});

createMail.failure = ({ listId, boardId }, error) => ({
  type: ActionTypes.MAIL_CREATE__FAILURE,
  payload: {
    listId,
    boardId,
    error,
  },
});

const handleMailCreate = (mail) => ({
  type: ActionTypes.MAIL_CREATE_HANDLE,
  payload: {
    mail,
  },
});

const updateMail = ({ listId, boardId }) => ({
  type: ActionTypes.MAIL_UPDATE,
  payload: {
    listId,
    boardId,
  },
});

updateMail.success = ({ listId, boardId }, mail) => ({
  type: ActionTypes.MAIL_UPDATE__SUCCESS,
  payload: {
    listId,
    boardId,
    mail,
  },
});

updateMail.failure = ({ listId, boardId }, error) => ({
  type: ActionTypes.MAIL_UPDATE__FAILURE,
  payload: {
    listId,
    boardId,
    error,
  },
});

const handleMailUpdate = (mail) => ({
  type: ActionTypes.MAIL_UPDATE_HANDLE,
  payload: {
    mail,
  },
});

const deleteMail = (mailId) => ({
  type: ActionTypes.MAIL_DELETE,
  payload: {
    mailId,
  },
});

deleteMail.success = (mailId, mail) => ({
  type: ActionTypes.MAIL_DELETE__SUCCESS,
  payload: {
    mailId,
    mail,
  },
});

deleteMail.failure = (mailId, error) => ({
  type: ActionTypes.MAIL_DELETE__FAILURE,
  payload: {
    mailId,
    error,
  },
});

const handleMailDelete = (mail) => ({
  type: ActionTypes.MAIL_DELETE_HANDLE,
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
