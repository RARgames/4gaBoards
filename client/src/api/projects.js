import http from './http';
import socket from './socket';
import { transformBoard, transformProject, transformUser } from './transformers';

/* Actions */

const getProjects = (headers) =>
  socket.get('/projects', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformProject),
    included: {
      ...body.included,
      boards: body.included.boards.map(transformBoard),
    },
  }));

const createProject = (data, headers) =>
  socket.post('/projects', data, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
  }));

const getProject = (id, headers) =>
  socket.get(`/projects/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
    included: {
      ...body.included,
      boards: body.included.boards.map(transformBoard),
      users: body.included.users.map(transformUser),
    },
  }));

const updateProject = (id, data, headers) =>
  socket.patch(`/projects/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
  }));

const updateProjectBackgroundImage = (id, data, headers) =>
  http.post(`/projects/${id}/background-image`, data, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
  }));

const deleteProject = (id, headers) =>
  socket.delete(`/projects/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
  }));

const importGettingStartedProject = (data, headers) =>
  socket.get('/projects/import-getting-started', data, headers).then((body) => ({
    ...body,
    item: transformProject(body.item),
    included: {
      ...body.included,
      boards: body.included.boards.map(transformBoard),
    },
  }));

/* Event handlers */

const makeHandleProjectCreate = (next) => (body) => {
  next({
    ...body,
    item: transformProject(body.item),
  });
};

const makeHandleProjectUpdate = makeHandleProjectCreate;

const makeHandleProjectDelete = makeHandleProjectCreate;

export default {
  getProjects,
  createProject,
  getProject,
  updateProject,
  updateProjectBackgroundImage,
  deleteProject,
  importGettingStartedProject,
  makeHandleProjectCreate,
  makeHandleProjectUpdate,
  makeHandleProjectDelete,
};
