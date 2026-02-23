import socket from './socket';
import { transformMailToken } from './transformers';

/* Actions */

const createMailToken = (data, headers) => {
  return socket.post(`/mailTokens`, data, headers).then((body) => ({
    ...body,
    item: transformMailToken(body.item),
  }));
};

const updateMailToken = (id, data, headers) => {
  return socket.patch(`mailTokens/${id}`, data, headers).then((body) => ({
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
