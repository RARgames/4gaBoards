import EntryActionTypes from '../constants/EntryActionTypes';

const updateCurrentUserPrefs = (data) => ({
  type: EntryActionTypes.CURRENT_USER_PREFS_UPDATE,
  payload: {
    data,
  },
});

const handleUserPrefsUpdate = (userPrefs) => ({
  type: EntryActionTypes.USER_PREFS_UPDATE_HANDLE,
  payload: {
    userPrefs,
  },
});

export default {
  updateCurrentUserPrefs,
  handleUserPrefsUpdate,
};
