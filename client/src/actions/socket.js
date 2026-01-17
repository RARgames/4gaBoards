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
  projectMemberships,
  boards,
  boardMemberships,
  labels,
  lists,
  cards,
  comments,
  core,
  cardMemberships,
  cardLabels,
  tasks,
  taskMemberships,
  attachments,
  activities,
  notifications,
  userPrefs,
) => ({
  type: ActionTypes.SOCKET_RECONNECT_HANDLE,
  payload: {
    user,
    board,
    users,
    projects,
    projectManagers,
    projectMemberships,
    boards,
    boardMemberships,
    labels,
    lists,
    cards,
    comments,
    core,
    cardMemberships,
    cardLabels,
    tasks,
    taskMemberships,
    attachments,
    activities,
    notifications,
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
