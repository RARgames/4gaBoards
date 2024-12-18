import socket from './socket';

/* Transformers */

export const transformTask = (task) => ({
  ...task,
  ...(task.dueDate && {
    dueDate: new Date(task.dueDate),
  }),
});

export const transformTaskData = (data) => ({
  ...data,
  ...(data.dueDate && {
    dueDate: data.dueDate.toISOString(),
  }),
});

/* Actions */

const createTask = (cardId, data, headers) =>
  socket.post(`/cards/${cardId}/tasks`, transformTaskData(data), headers).then((body) => ({
    ...body,
    item: transformTask(body.item),
  }));

const updateTask = (id, data, headers) =>
  socket.patch(`/tasks/${id}`, transformTaskData(data), headers).then((body) => ({
    ...body,
    item: transformTask(body.item),
  }));

const duplicateTask = (id, headers) =>
  socket.post(`/tasks/${id}/duplicate`, undefined, headers).then((body) => ({
    ...body,
    item: transformTask(body.item),
  }));

const deleteTask = (id, headers) =>
  socket.delete(`/tasks/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformTask(body.item),
  }));

/* Event handlers */

const makeHandleTaskCreate = (next) => (body) => {
  next({
    ...body,
    item: transformTask(body.item),
  });
};

const makeHandleTaskUpdate = makeHandleTaskCreate;

const makeHandleTaskDuplicate = makeHandleTaskCreate;

const makeHandleTaskDelete = makeHandleTaskCreate;

export default {
  createTask,
  updateTask,
  duplicateTask,
  deleteTask,
  makeHandleTaskCreate,
  makeHandleTaskUpdate,
  makeHandleTaskDuplicate,
  makeHandleTaskDelete,
};
