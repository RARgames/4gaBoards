import EntryActionTypes from '../constants/EntryActionTypes';

const initializeCore = () => ({
  type: EntryActionTypes.CORE_INITIALIZE,
  payload: {},
});

const logout = () => ({
  type: EntryActionTypes.LOGOUT,
  payload: {},
});

const updateCoreSettings = (data) => ({
  type: EntryActionTypes.CORE_SETTINGS_UPDATE,
  payload: { data },
});

const handleCoreSettingsUpdate = (data) => ({
  type: EntryActionTypes.CORE_SETTINGS_UPDATE_HANDLE,
  payload: {
    data,
  },
});

export default {
  initializeCore,
  logout,
  updateCoreSettings,
  handleCoreSettingsUpdate,
};
