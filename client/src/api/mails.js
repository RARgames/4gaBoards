import socket from './socket';

/* Actions */

const createMail = (listId, headers) =>
  socket.post(`/lists/${listId}/mails`, {}, headers).then((body) => ({
    ...body,
    item: body.item,
  }));

const showMail = (mailId, headers) =>
  socket.get(`/mails/${mailId}`, {}, headers).then((body) => ({
    ...body,
    item: body.item,
  }));

const updateMail = (listId, headers) =>
  socket.post(`/mails/${listId}/update`, {}, headers).then((body) => ({
    ...body,
    item: body.item,
  }));

export default {
  createMail,
  showMail,
  updateMail,
};
