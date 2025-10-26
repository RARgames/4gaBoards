import socket from './socket';
import { transformMail } from './transformers';

/* Actions */

const createMail = (listId, headers) =>
  socket.post(`/lists/${listId}/mails`, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));

const updateMail = (listId, headers) =>
  socket.patch(`/mails/${listId}/update`, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));

/* Event handlers */

const makeHandleMailCreate = (next) => (body) => {
  next({
    ...body,
    item: transformMail(body.item),
  });
};

const makeHandleMailUpdate = makeHandleMailCreate;

export default {
  createMail,
  updateMail,
  makeHandleMailCreate,
  makeHandleMailUpdate,
};
