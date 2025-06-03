import socket from './socket';
import { transformList } from './transformers';

/* Actions */

const createList = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/lists`, data, headers).then((body) => ({
    ...body,
    item: transformList(body.item),
  }));

const updateList = (id, data, headers) =>
  socket.patch(`/lists/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformList(body.item),
  }));

const deleteList = (id, headers) =>
  socket.delete(`/lists/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformList(body.item),
  }));

/* Event handlers */

const makeHandleListCreate = (next) => (body) => {
  next({
    ...body,
    item: transformList(body.item),
  });
};

const makeHandleListUpdate = makeHandleListCreate;

const makeHandleListDelete = makeHandleListCreate;

export default {
  createList,
  updateList,
  deleteList,
  makeHandleListCreate,
  makeHandleListUpdate,
  makeHandleListDelete,
};
