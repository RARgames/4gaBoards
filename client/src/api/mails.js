import socket from './socket';

/* Actions */

const createMail = (data, headers) =>
  socket.post(`/mails`, data, headers).then((body) => ({
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
