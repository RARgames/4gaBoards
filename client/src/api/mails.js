import socket from './socket';
import { transformMail } from './transformers';

/* Actions */

const createMail = (listId, headers) =>
  socket.post(`/lists/${listId}/mails`, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));

const showMail = (mailId, headers) =>
  socket.get(`/mails/${mailId}`, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));

const updateMail = (mailId, headers) =>
  socket.post(`/mails/${mailId}/update`, {}, headers).then((body) => ({
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

export default {
  createMail,
  showMail,
  updateMail,
  makeHandleMailCreate,
};
