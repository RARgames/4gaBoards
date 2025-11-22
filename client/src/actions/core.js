import ActionTypes from '../constants/ActionTypes';

const initializeCore = (
  user,
  board,
  users,
  projects,
  projectManagers,
  boards,
  boardMemberships,
  labels,
  lists,
  mails,
  cards,
  core,
  cardMemberships,
  cardLabels,
  tasks,
  taskMemberships,
  attachments,
  activities,
  notifications,
  userProjects,
  userPrefs,
) => ({
  type: ActionTypes.CORE_INITIALIZE,
  payload: {
    user,
    board,
    users,
    projects,
    projectManagers,
    boards,
    boardMemberships,
    labels,
    lists,
    mails,
    cards,
    core,
    cardMemberships,
    cardLabels,
    tasks,
    taskMemberships,
    attachments,
    activities,
    notifications,
    userProjects,
    userPrefs,
  },
});

const logout = () => ({
  type: ActionTypes.LOGOUT,
  payload: {},
});

logout.invalidateAccessToken = () => ({
  type: ActionTypes.LOGOUT__ACCESS_TOKEN_INVALIDATE,
  payload: {},
});

const fetchCoreSettingsPublic = (data) => ({
  type: ActionTypes.FETCH_CORE_SETTINGS_PUBLIC,
  payload: {
    data,
  },
});

const updateCoreSettings = (data) => ({
  type: ActionTypes.CORE_SETTINGS_UPDATE,
  payload: {
    data,
  },
});

updateCoreSettings.success = (data) => ({
  type: ActionTypes.CORE_SETTINGS_UPDATE__SUCCESS,
  payload: {
    data,
  },
});

updateCoreSettings.failure = (error) => ({
  type: ActionTypes.CORE_SETTINGS_UPDATE__FAILURE,
  payload: {
    error,
  },
});

const handleCoreSettingsUpdate = (data) => ({
  type: ActionTypes.CORE_SETTINGS_UPDATE_HANDLE,
  payload: {
    data,
  },
});

export default {
  initializeCore,
  logout,
  fetchCoreSettingsPublic,
  updateCoreSettings,
  handleCoreSettingsUpdate,
};
