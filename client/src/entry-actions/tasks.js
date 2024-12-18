import EntryActionTypes from '../constants/EntryActionTypes';

const createTask = (cardId, data) => ({
  type: EntryActionTypes.TASK_CREATE,
  payload: {
    cardId,
    data,
  },
});

const createTaskInCurrentCard = (data) => ({
  type: EntryActionTypes.TASK_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const handleTaskCreate = (task) => ({
  type: EntryActionTypes.TASK_CREATE_HANDLE,
  payload: {
    task,
  },
});

const updateTask = (id, data) => ({
  type: EntryActionTypes.TASK_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleTaskUpdate = (task) => ({
  type: EntryActionTypes.TASK_UPDATE_HANDLE,
  payload: {
    task,
  },
});

const duplicateTask = (id) => ({
  type: EntryActionTypes.TASK_DUPLICATE,
  payload: {
    id,
  },
});

const handleTaskDuplicate = (task) => ({
  type: EntryActionTypes.TASK_DUPLICATE_HANDLE,
  payload: {
    task,
  },
});

const moveTask = (id, index) => ({
  type: EntryActionTypes.TASK_MOVE,
  payload: {
    id,
    index,
  },
});

const deleteTask = (id) => ({
  type: EntryActionTypes.TASK_DELETE,
  payload: {
    id,
  },
});

const handleTaskDelete = (task) => ({
  type: EntryActionTypes.TASK_DELETE_HANDLE,
  payload: {
    task,
  },
});

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
