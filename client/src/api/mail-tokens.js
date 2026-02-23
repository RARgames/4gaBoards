import socket from './socket';
import { transformMailToken } from './transformers';

/* Actions */

const createMailToken = (data, headers) => {
  const url = data.listId ? `/lists/${data.listId}/mailTokens` : `/boards/${data.boardId}/mailTokens`;

  return socket.post(url, {}, headers).then((body) => ({
    ...body,
    item: transformMailToken(body.item),
  }));
};

const updateMailToken = (id, data, headers) => {
  const url = data.listId ? `/lists/${data.listId}/mailTokens/update` : `/boards/${data.boardId}/mailTokens/update`;

  return socket.patch(url, {}, headers).then((body) => ({
    ...body,
    item: transformMailToken(body.item),
  }));
};

const deleteMailToken = (id, headers) =>
  socket.delete(`/mailTokens/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformMailToken(body.item),
  }));

/* Event handlers */

const makeHandleMailTokenCreate = (next) => (body) => {
  next({
    ...body,
    item: transformMailToken(body.item),
  });
};

const makeHandleMailTokenUpdate = makeHandleMailTokenCreate;
const makeHandleMailTokenDelete = makeHandleMailTokenCreate;

export default {
  createMailToken,
  updateMailToken,
  deleteMailToken,
  makeHandleMailTokenCreate,
  makeHandleMailTokenUpdate,
  makeHandleMailTokenDelete,
};
