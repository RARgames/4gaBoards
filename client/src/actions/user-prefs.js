import ActionTypes from '../constants/ActionTypes';

const updateUserPrefs = (id, data) => ({
  type: ActionTypes.USER_PREFS_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserPrefs.success = (userPrefs) => ({
  type: ActionTypes.USER_PREFS_UPDATE__SUCCESS,
  payload: {
    userPrefs,
  },
});

updateUserPrefs.failure = (error, userPrefs) => ({
  type: ActionTypes.USER_PREFS_UPDATE__FAILURE,
  payload: {
    error,
    userPrefs,
  },
});

const handleUserPrefsUpdate = (userPrefs) => ({
  type: ActionTypes.USER_PREFS_UPDATE_HANDLE,
  payload: {
    userPrefs,
  },
});

export default {
  updateUserPrefs,
  handleUserPrefsUpdate,
};
