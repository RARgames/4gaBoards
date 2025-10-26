import ActionTypes from '../constants/ActionTypes';

const createMail = (listId) => ({
  type: ActionTypes.MAIL_CREATE,
  payload: {
    listId,
  },
});

createMail.success = (listId, mail) => ({
  type: ActionTypes.MAIL_CREATE__SUCCESS,
  payload: {
    listId,
    mail,
  },
});

createMail.failure = (listId, error) => ({
  type: ActionTypes.MAIL_CREATE__FAILURE,
  payload: {
    listId,
    error,
  },
});

const handleMailCreate = (mail) => ({
  type: ActionTypes.MAIL_CREATE_HANDLE,
  payload: {
    mail,
  },
});

const updateMail = (listId) => ({
  type: ActionTypes.MAIL_UPDATE,
  payload: {
    listId,
  },
});

updateMail.success = (listId, mail) => ({
  type: ActionTypes.MAIL_UPDATE__SUCCESS,
  payload: {
    listId,
    mail,
  },
});

updateMail.failure = (listId, error) => ({
  type: ActionTypes.MAIL_UPDATE__FAILURE,
  payload: {
    listId,
    error,
  },
});

const handleMailUpdate = (mail) => ({
  type: ActionTypes.MAIL_UPDATE_HANDLE,
  payload: {
    mail,
  },
});

export default {
  createMail,
  handleMailCreate,
  updateMail,
  handleMailUpdate,
};
