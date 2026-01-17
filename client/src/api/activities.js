import socket from './socket';
import { transformActivity, transformUser } from './transformers';

/* Actions */

const getAttachmentActivities = (attachmentId, data, headers) =>
  socket.get(`/attachments/${attachmentId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getCommentActivities = (commentId, data, headers) =>
  socket.get(`/comments/${commentId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getTaskActivities = (taskId, data, headers) =>
  socket.get(`/tasks/${taskId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getCardActivities = (cardId, data, headers) =>
  socket.get(`/cards/${cardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getListActivities = (listId, data, headers) =>
  socket.get(`/lists/${listId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getBoardActivities = (boardId, data, headers) =>
  socket.get(`/boards/${boardId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getProjectActivities = (projectId, data, headers) =>
  socket.get(`/projects/${projectId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getUserActivities = (userId, data, headers) =>
  socket.get(`/users/${userId}/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getUserAccountActivities = (userAccountId, data, headers) =>
  socket.get(`/users/${userAccountId}/account-actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
  }));

const getInstanceActivities = (data, headers) =>
  socket.get(`/instance/actions`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformActivity),
    included: {
      users: body.included.users.map(transformUser),
    },
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
  getInstanceActivities,
  makeHandleActivityCreate,
};
