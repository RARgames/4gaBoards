import socket from './socket';
import { transformActivity } from './transformers';

/* Actions */

const getAttachmentActivities = (attachmentId, data, headers) =>
  socket.get(`/attachments/${attachmentId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getCardActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getListActivities = (listId, data, headers) =>
  socket.get(`/lists/${listId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getBoardActivities = (boardId, data, headers) =>
  socket.get(`/boards/${boardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getProjectActivities = (projectId, data, headers) =>
  socket.get(`/projects/${projectId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

/* Event handlers */

const makeHandleActivityCreate = (next) => (body) => {
  next({
    ...body,
    item: transformActivity(body.item),
  });
};

export default {
  getAttachmentActivities,
  getCardActivities,
  getListActivities,
  getBoardActivities,
  getProjectActivities,
  makeHandleActivityCreate,
};
