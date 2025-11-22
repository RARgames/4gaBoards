import ActionTypes from '../constants/ActionTypes';

const handleSocketDisconnect = () => ({
  type: ActionTypes.SOCKET_DISCONNECT_HANDLE,
  payload: {},
});

const handleSocketReconnect = (
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
  type: ActionTypes.SOCKET_RECONNECT_HANDLE,
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

handleSocketReconnect.fetchCore = (currentUserId, currentBoardId) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE__CORE_FETCH,
  payload: {
    currentUserId,
    currentBoardId,
  },
});

export default {
  handleSocketDisconnect,
  handleSocketReconnect,
};
