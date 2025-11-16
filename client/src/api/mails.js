import socket from './socket';
import { transformMail } from './transformers';

/* Actions */

const createMail = ({ listId, boardId }, headers) => {
  const url = listId ? `/lists/${listId}/mails` : `/boards/${boardId}/mails`;

  return socket.post(url, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));
};

const updateMail = ({ listId, boardId }, headers) => {
  const url = listId ? `/lists/${listId}/mails/update` : `/boards/${boardId}/mails/update`;

  return socket.patch(url, {}, headers).then((body) => ({
    ...body,
    item: transformMail(body.item),
  }));
};

const deleteMail = (mailId, headers) =>
  socket.delete(`/mails/${mailId}`, undefined, headers).then((body) => ({
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

const makeHandleMailDelete = makeHandleMailCreate;

export default {
  createMail,
  updateMail,
  deleteMail,
  makeHandleMailCreate,
  makeHandleMailUpdate,
  makeHandleMailDelete,
};
