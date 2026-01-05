import socket from './socket';
import { transformActivity } from './transformers';

/* Actions */

const getAttachmentActivities = (attachmentId, data, headers) =>
  socket.get(`/attachments/${attachmentId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getCommentActivities = (commentId, data, headers) =>
  socket.get(`/comments/${commentId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getTaskActivities = (taskId, data, headers) =>
  socket.get(`/tasks/${taskId}/actions`, data, headers).then((body) => ({
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

const getUserActivities = (userId, data, headers) =>
  socket.get(`/users/${userId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
  }));

const getUserAccountActivities = (userAccountId, data, headers) =>
  socket.get(`/users/${userAccountId}/account-actions`, data, headers).then((body) => ({
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
  getCommentActivities,
  getTaskActivities,
  getCardActivities,
  getListActivities,
  getBoardActivities,
  getProjectActivities,
  getUserActivities,
  getUserAccountActivities,
  makeHandleActivityCreate,
};
