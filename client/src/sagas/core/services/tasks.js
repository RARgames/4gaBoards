import { all, call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';
import { addUserToTask } from './users';

export function* createTask(cardId, data) {
  const { userIds, ...restData } = data;

  const nextData = {
    ...restData,
    position: yield select(selectors.selectNextTaskPosition, cardId),
  };

  const localId = yield call(createLocalId);

  yield put(
    actions.createTask({
      ...nextData,
      cardId,
      id: localId,
    }),
  );

  let task;
  try {
    ({ item: task } = yield call(request, api.createTask, cardId, nextData));
  } catch (error) {
    yield put(actions.createTask.failure(localId, error));
    return;
  }

  yield put(actions.createTask.success(localId, task));

  if (userIds) {
    yield all(userIds.map((userId) => call(addUserToTask, userId, task.id, cardId)));
  }
}

export function* createTaskInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createTask, cardId, data);
}

export function* handleTaskCreate(task) {
  yield put(actions.handleTaskCreate(task));
}

export function* updateTask(id, data) {
  const { userIds, ...restData } = data;

  yield put(actions.updateTask(id, restData));

  let task;
  try {
    ({ item: task } = yield call(request, api.updateTask, id, restData));
  } catch (error) {
    yield put(actions.updateTask.failure(id, error));
    return;
  }

  yield put(actions.updateTask.success(task));

  if (userIds) {
    const { cardId } = task;
    yield all(userIds.map((userId) => call(addUserToTask, userId, task.id, cardId)));
  }
}

export function* handleTaskUpdate(task) {
  yield put(actions.handleTaskUpdate(task));
}

export function* duplicateTask(id) {
  yield put(actions.duplicateTask(id));

  let task;
  let taskMemberships;
  try {
    ({
      item: task,
      included: { taskMemberships },
    } = yield call(request, api.duplicateTask, id));
  } catch (error) {
    yield put(actions.duplicateTask.failure(id, error));
    return;
  }

  yield put(actions.duplicateTask.success(task, taskMemberships));
}

export function* handleTaskDuplicate(task) {
  yield put(actions.handleTaskDuplicate(task));
}

export function* moveTask(id, index) {
  const { cardId } = yield select(selectors.selectTaskById, id);
  const position = yield select(selectors.selectNextTaskPosition, cardId, index, id);

  yield call(updateTask, id, {
    position,
  });
}

export function* deleteTask(id) {
  yield put(actions.deleteTask(id));

  let task;
  try {
    ({ item: task } = yield call(request, api.deleteTask, id));
  } catch (error) {
    yield put(actions.deleteTask.failure(id, error));
    return;
  }

  yield put(actions.deleteTask.success(task));
}

export function* handleTaskDelete(task) {
  yield put(actions.handleTaskDelete(task));
}

export default {
  createTask,
  createTaskInCurrentCard,
  handleTaskCreate,
  updateTask,
  handleTaskUpdate,
  duplicateTask,
  handleTaskDuplicate,
  moveTask,
  deleteTask,
  handleTaskDelete,
};
