import ActionTypes from '../constants/ActionTypes';

const createUser = (data) => ({
  type: ActionTypes.USER_CREATE,
  payload: {
    data,
  },
});

createUser.success = (user) => ({
  type: ActionTypes.USER_CREATE__SUCCESS,
  payload: {
    user,
  },
});

createUser.failure = (error) => ({
  type: ActionTypes.USER_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleUserCreate = (user) => ({
  type: ActionTypes.USER_CREATE_HANDLE,
  payload: {
    user,
  },
});

const clearUserCreateError = () => ({
  type: ActionTypes.USER_CREATE_ERROR_CLEAR,
  payload: {},
});

const updateUser = (id, data) => ({
  type: ActionTypes.USER_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUser.success = (user) => ({
  type: ActionTypes.USER_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUser.failure = (id, error, user) => ({
  type: ActionTypes.USER_UPDATE__FAILURE,
  payload: {
    id,
    error,
    user,
  },
});

const handleUserUpdate = (user, users, isCurrent) => ({
  type: ActionTypes.USER_UPDATE_HANDLE,
  payload: {
    user,
    users,
    isCurrent,
  },
});

const updateUserEmail = (id, data) => ({
  type: ActionTypes.USER_EMAIL_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserEmail.success = (user) => ({
  type: ActionTypes.USER_EMAIL_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserEmail.failure = (id, error) => ({
  type: ActionTypes.USER_EMAIL_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserEmailUpdateError = (id) => ({
  type: ActionTypes.USER_EMAIL_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserPassword = (id, data) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserPassword.success = (user, accessToken) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__SUCCESS,
  payload: {
    user,
    accessToken,
  },
});

updateUserPassword.failure = (id, error) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserPasswordUpdateError = (id) => ({
  type: ActionTypes.USER_PASSWORD_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserUsername = (id, data) => ({
  type: ActionTypes.USER_USERNAME_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserUsername.success = (user) => ({
  type: ActionTypes.USER_USERNAME_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserUsername.failure = (id, error) => ({
  type: ActionTypes.USER_USERNAME_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const clearUserUsernameUpdateError = (id) => ({
  type: ActionTypes.USER_USERNAME_UPDATE_ERROR_CLEAR,
  payload: {
    id,
  },
});

const updateUserAvatar = (id) => ({
  type: ActionTypes.USER_AVATAR_UPDATE,
  payload: {
    id,
  },
});

updateUserAvatar.success = (user) => ({
  type: ActionTypes.USER_AVATAR_UPDATE__SUCCESS,
  payload: {
    user,
  },
});

updateUserAvatar.failure = (id, error) => ({
  type: ActionTypes.USER_AVATAR_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteUser = (id) => ({
  type: ActionTypes.USER_DELETE,
  payload: {
    id,
  },
});

deleteUser.success = (user) => ({
  type: ActionTypes.USER_DELETE__SUCCESS,
  payload: {
    user,
  },
});

deleteUser.failure = (id, error) => ({
  type: ActionTypes.USER_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleUserDelete = (user) => ({
  type: ActionTypes.USER_DELETE_HANDLE,
  payload: {
    user,
  },
});

const addUserToCard = (id, cardId, isCurrent) => ({
  type: ActionTypes.USER_TO_CARD_ADD,
  payload: {
    id,
    cardId,
    isCurrent,
  },
});

addUserToCard.success = (cardMembership) => ({
  type: ActionTypes.USER_TO_CARD_ADD__SUCCESS,
  payload: {
    cardMembership,
  },
});

addUserToCard.failure = (id, cardId, error) => ({
  type: ActionTypes.USER_TO_CARD_ADD__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

const handleUserToCardAdd = (cardMembership) => ({
  type: ActionTypes.USER_TO_CARD_ADD_HANDLE,
  payload: {
    cardMembership,
  },
});

const removeUserFromCard = (id, cardId) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE,
  payload: {
    id,
    cardId,
  },
});

removeUserFromCard.success = (cardMembership) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE__SUCCESS,
  payload: {
    cardMembership,
  },
});

removeUserFromCard.failure = (id, cardId, error) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE__FAILURE,
  payload: {
    id,
    cardId,
    error,
  },
});

const handleUserFromCardRemove = (cardMembership) => ({
  type: ActionTypes.USER_FROM_CARD_REMOVE_HANDLE,
  payload: {
    cardMembership,
  },
});

const addUserToTask = (id, taskId, cardId, isCurrent) => ({
  type: ActionTypes.USER_TO_TASK_ADD,
  payload: {
    id,
    taskId,
    cardId,
    isCurrent,
  },
});

addUserToTask.success = (taskMembership) => ({
  type: ActionTypes.USER_TO_TASK_ADD__SUCCESS,
  payload: {
    taskMembership,
  },
});

addUserToTask.failure = (id, taskId, error) => ({
  type: ActionTypes.USER_TO_TASK_ADD__FAILURE,
  payload: {
    id,
    taskId,
    error,
  },
});

const handleUserToTaskAdd = (taskMembership) => ({
  type: ActionTypes.USER_TO_TASK_ADD_HANDLE,
  payload: {
    taskMembership,
  },
});

const removeUserFromTask = (id, taskId) => ({
  type: ActionTypes.USER_FROM_TASK_REMOVE,
  payload: {
    id,
    taskId,
  },
});

removeUserFromTask.success = (taskMembership) => ({
  type: ActionTypes.USER_FROM_TASK_REMOVE__SUCCESS,
  payload: {
    taskMembership,
  },
});

removeUserFromTask.failure = (id, taskId, error) => ({
  type: ActionTypes.USER_FROM_TASK_REMOVE__FAILURE,
  payload: {
    id,
    taskId,
    error,
  },
});

const handleUserFromTaskRemove = (taskMembership) => ({
  type: ActionTypes.USER_FROM_TASK_REMOVE_HANDLE,
  payload: {
    taskMembership,
  },
});

const addUserToBoardFilter = (id, boardId) => ({
  type: ActionTypes.USER_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
  },
});

const removeUserFromBoardFilter = (id, boardId) => ({
  type: ActionTypes.USER_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
  },
});

const updateUserFilterQuery = (id, data, isCurrent) => ({
  type: ActionTypes.USER_FILTER_QUERY_UPDATE,
  payload: {
    id,
    data,
    isCurrent,
  },
});

export default {
  createUser,
  handleUserCreate,
  clearUserCreateError,
  updateUser,
  handleUserUpdate,
  updateUserEmail,
  clearUserEmailUpdateError,
  updateUserPassword,
  clearUserPasswordUpdateError,
  updateUserUsername,
  clearUserUsernameUpdateError,
  updateUserAvatar,
  deleteUser,
  handleUserDelete,
  addUserToCard,
  handleUserToCardAdd,
  removeUserFromCard,
  handleUserFromCardRemove,
  addUserToTask,
  handleUserToTaskAdd,
  removeUserFromTask,
  handleUserFromTaskRemove,
  addUserToBoardFilter,
  removeUserFromBoardFilter,
  updateUserFilterQuery,
};
