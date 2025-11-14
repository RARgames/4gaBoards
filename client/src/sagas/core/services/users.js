import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { setAccessToken } from '../../../utils/access-token-storage';
import request from '../request';
import { logout } from './core';

export function* createUser(data) {
  yield put(actions.createUser(data));

  let user;
  try {
    ({ item: user } = yield call(request, api.createUser, data));
  } catch (error) {
    yield put(actions.createUser.failure(error));
    return;
  }

  yield put(actions.createUser.success(user));
}

export function* handleUserCreate(user) {
  yield put(actions.handleUserCreate(user));
}

export function* clearUserCreateError() {
  yield put(actions.clearUserCreateError());
}

export function* updateUser(id, data) {
  const currentUser = yield select(selectors.selectCurrentUser);
  yield put(actions.updateUser(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUser, id, data));
  } catch (error) {
    yield put(actions.updateUser.failure(id, error, currentUser));
    return;
  }

  yield put(actions.updateUser.success(user));
}

export function* updateCurrentUser(data) {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(updateUser, id, data);
}

export function* handleUserUpdate(user) {
  const currentUser = yield select(selectors.selectCurrentUser);
  const isCurrent = user.id === currentUser.id;

  let users;
  if (isCurrent && !currentUser.isAdmin && user.isAdmin) {
    ({ items: users } = yield call(request, api.getUsers));
  }

  yield put(actions.handleUserUpdate(user, users, isCurrent));
}

export function* updateUserEmail(id, data) {
  yield put(actions.updateUserEmail(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserEmail, id, data));
  } catch (error) {
    yield put(actions.updateUserEmail.failure(id, error));
    return;
  }

  yield put(actions.updateUserEmail.success(user));
}

export function* updateCurrentUserEmail(data) {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(updateUserEmail, id, data);
}

export function* clearUserEmailUpdateError(id) {
  yield put(actions.clearUserEmailUpdateError(id));
}

export function* clearCurrentUserEmailUpdateError() {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(clearUserEmailUpdateError, id);
}

export function* updateUserPassword(id, data) {
  yield put(actions.updateUserPassword(id, data));

  let user;
  let accessTokens;

  try {
    ({ item: user, included: { accessTokens } = {} } = yield call(request, api.updateUserPassword, id, data));
  } catch (error) {
    yield put(actions.updateUserPassword.failure(id, error));
    return;
  }

  const accessToken = accessTokens && accessTokens[0];

  if (accessToken) {
    yield call(setAccessToken, accessToken);
  }

  yield put(actions.updateUserPassword.success(user, accessToken));
}

export function* updateCurrentUserPassword(data) {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(updateUserPassword, id, data);
}

export function* clearUserPasswordUpdateError(id) {
  yield put(actions.clearUserPasswordUpdateError(id));
}

export function* clearCurrentUserPasswordUpdateError() {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(clearUserPasswordUpdateError, id);
}

export function* updateUserUsername(id, data) {
  yield put(actions.updateUserUsername(id, data));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserUsername, id, data));
  } catch (error) {
    yield put(actions.updateUserUsername.failure(id, error));
    return;
  }

  yield put(actions.updateUserUsername.success(user));
}

export function* updateCurrentUserUsername(data) {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(updateUserUsername, id, data);
}

export function* clearUserUsernameUpdateError(id) {
  yield put(actions.clearUserUsernameUpdateError(id));
}

export function* clearCurrentUserUsernameUpdateError() {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(clearUserUsernameUpdateError, id);
}

export function* updateUserAvatar(id, data) {
  yield put(actions.updateUserAvatar(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.updateUserAvatar, id, data));
  } catch (error) {
    yield put(actions.updateUserAvatar.failure(id, error));
    return;
  }

  yield put(actions.updateUserAvatar.success(user));
}

export function* updateCurrentUserAvatar(data) {
  const id = yield select(selectors.selectCurrentUserId);

  yield call(updateUserAvatar, id, data);
}

export function* deleteUser(id) {
  yield put(actions.deleteUser(id));

  let user;
  try {
    ({ item: user } = yield call(request, api.deleteUser, id));
  } catch (error) {
    yield put(actions.deleteUser.failure(id, error));
    return;
  }

  yield put(actions.deleteUser.success(user));
}

export function* handleUserDelete(user) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  if (user.id === currentUserId) {
    yield call(logout, false);
  }

  yield put(actions.handleUserDelete(user));
}

export function* addUserToCard(id, cardId) {
  const currentUserId = yield select(selectors.selectCurrentUserId);

  yield put(actions.addUserToCard(id, cardId, id === currentUserId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.createCardMembership, cardId, {
      userId: id,
    }));
  } catch (error) {
    yield put(actions.addUserToCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.addUserToCard.success(cardMembership));
}

export function* addUserToCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(addUserToCard, id, cardId);
}

export function* handleUserToCardAdd(cardMembership) {
  yield put(actions.handleUserToCardAdd(cardMembership));
}

export function* removeUserFromCard(id, cardId) {
  yield put(actions.removeUserFromCard(id, cardId));

  let cardMembership;
  try {
    ({ item: cardMembership } = yield call(request, api.deleteCardMembership, cardId, id));
  } catch (error) {
    yield put(actions.removeUserFromCard.failure(id, cardId, error));
    return;
  }

  yield put(actions.removeUserFromCard.success(cardMembership));
}

export function* removeUserFromCurrentCard(id) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(removeUserFromCard, id, cardId);
}

export function* handleUserFromCardRemove(cardMembership) {
  yield put(actions.handleUserFromCardRemove(cardMembership));
}

export function* addUserToTask(id, taskId, cardId) {
  const currentUserId = yield select(selectors.selectCurrentUserId);
  yield put(actions.addUserToTask(id, taskId, cardId, id === currentUserId));

  let taskMembership;
  try {
    ({ item: taskMembership } = yield call(request, api.createTaskMembership, taskId, {
      userId: id,
      cardId,
    }));
  } catch (error) {
    yield put(actions.addUserToTask.failure(id, taskId, error));
    return;
  }

  yield put(actions.addUserToTask.success(taskMembership));
}

export function* handleUserToTaskAdd(taskMembership) {
  yield put(actions.handleUserToTaskAdd(taskMembership));
}

export function* removeUserFromTask(id, taskId) {
  yield put(actions.removeUserFromTask(id, taskId));

  let taskMembership;
  try {
    ({ item: taskMembership } = yield call(request, api.deleteTaskMembership, taskId, id));
  } catch (error) {
    yield put(actions.removeUserFromTask.failure(id, taskId, error));
    return;
  }

  yield put(actions.removeUserFromTask.success(taskMembership));
}

export function* handleUserFromTaskRemove(taskMembership) {
  yield put(actions.handleUserFromTaskRemove(taskMembership));
}

export function* addUserToBoardFilter(id, boardId) {
  yield put(actions.addUserToBoardFilter(id, boardId));
}

export function* addUserToFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addUserToBoardFilter, id, boardId);
}

export function* removeUserFromBoardFilter(id, boardId) {
  yield put(actions.removeUserFromBoardFilter(id, boardId));
}

export function* removeUserFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removeUserFromBoardFilter, id, boardId);
}

export function* updateCurrentUserFilterQuery(data) {
  const id = yield select(selectors.selectCurrentUserId);
  yield put(actions.updateUserFilterQuery(id, data));
}

export function* updateCurrentUserNotificationFilterQuery(data) {
  const id = yield select(selectors.selectCurrentUserId);
  yield put(actions.updateUserNotificationFilterQuery(id, data));
}

export default {
  createUser,
  handleUserCreate,
  clearUserCreateError,
  updateUser,
  updateCurrentUser,
  handleUserUpdate,
  updateUserEmail,
  updateCurrentUserEmail,
  clearUserEmailUpdateError,
  clearCurrentUserEmailUpdateError,
  updateUserPassword,
  updateCurrentUserPassword,
  clearUserPasswordUpdateError,
  clearCurrentUserPasswordUpdateError,
  updateUserUsername,
  updateCurrentUserUsername,
  clearUserUsernameUpdateError,
  clearCurrentUserUsernameUpdateError,
  updateUserAvatar,
  updateCurrentUserAvatar,
  deleteUser,
  handleUserDelete,
  addUserToCard,
  addUserToCurrentCard,
  handleUserToCardAdd,
  removeUserFromCard,
  removeUserFromCurrentCard,
  handleUserFromCardRemove,
  addUserToTask,
  handleUserToTaskAdd,
  removeUserFromTask,
  handleUserFromTaskRemove,
  addUserToBoardFilter,
  addUserToFilterInCurrentBoard,
  removeUserFromBoardFilter,
  removeUserFromFilterInCurrentBoard,
  updateCurrentUserFilterQuery,
  updateCurrentUserNotificationFilterQuery,
};
