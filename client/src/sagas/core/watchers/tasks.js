import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* tasksWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TASK_CREATE, ({ payload: { cardId, data } }) => services.createTask(cardId, data)),
    takeEvery(EntryActionTypes.TASK_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) => services.createTaskInCurrentCard(data)),
    takeEvery(EntryActionTypes.TASK_CREATE_HANDLE, ({ payload: { task } }) => services.handleTaskCreate(task)),
    takeEvery(EntryActionTypes.TASK_UPDATE, ({ payload: { id, data } }) => services.updateTask(id, data)),
    takeEvery(EntryActionTypes.TASK_UPDATE_HANDLE, ({ payload: { task } }) => services.handleTaskUpdate(task)),
    takeEvery(EntryActionTypes.TASK_DUPLICATE, ({ payload: { id } }) => services.duplicateTask(id)),
    takeEvery(EntryActionTypes.TASK_DUPLICATE_HANDLE, ({ payload: { task } }) => services.handleTaskDuplicate(task)),
    takeEvery(EntryActionTypes.TASK_MOVE, ({ payload: { id, index } }) => services.moveTask(id, index)),
    takeEvery(EntryActionTypes.TASK_DELETE, ({ payload: { id } }) => services.deleteTask(id)),
    takeEvery(EntryActionTypes.TASK_DELETE_HANDLE, ({ payload: { task } }) => services.handleTaskDelete(task)),
  ]);
}
