import http from './http';
import socket from './socket';

/* Transformers */

export const transformUser = (user) => ({
  ...user,
  createdAt: new Date(user.createdAt),
  ...(user.lastLogin && {
    lastLogin: new Date(user.lastLogin),
  }),
});

export const transformUserData = (data) => ({
  ...data,
  ...(data.lastLogin && {
    lastLogin: data.lastLogin.toISOString(),
  }),
});

/* Actions */

const getUsers = (headers) =>
  socket.get('/users', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformUser),
  }));

const createUser = (data, headers) =>
  socket.post('/users', transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const getUser = (id, headers) =>
  socket.get(`/users/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const getCurrentUser = (subscribe, headers) =>
  socket.get(`/users/me${subscribe ? '?subscribe=true' : ''}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUser = (id, data, headers) =>
  socket.patch(`/users/${id}`, transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserEmail = (id, data, headers) =>
  socket.patch(`/users/${id}/email`, transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserPassword = (id, data, headers) =>
  socket.patch(`/users/${id}/password`, transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserUsername = (id, data, headers) =>
  socket.patch(`/users/${id}/username`, transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const updateUserAvatar = (id, data, headers) =>
  http.post(`/users/${id}/avatar`, transformUserData(data), headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

const deleteUser = (id, headers) =>
  socket.delete(`/users/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformUser(body.item),
  }));

/* Event handlers */

const makeHandleUserCreate = (next) => (body) => {
  next({
    ...body,
    item: transformUser(body.item),
  });
};

const makeHandleUserUpdate = makeHandleUserCreate;

const makeHandleUserDelete = makeHandleUserCreate;

export default {
  getUsers,
  createUser,
  getUser,
  getCurrentUser,
  updateUser,
  updateUserEmail,
  updateUserPassword,
  updateUserUsername,
  updateUserAvatar,
  deleteUser,
  makeHandleUserCreate,
  makeHandleUserUpdate,
  makeHandleUserDelete,
};
