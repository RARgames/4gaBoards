import http from './http';
import socket from './socket';
import { transformAttachment, transformBoard, transformProject, transformCard, transformList, transformMail, transformTask, transformUser } from './transformers';

/* Actions */

const createBoard = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/boards`, data, headers).then((body) => ({
    ...body,
    item: transformBoard(body.item),
  }));

const createBoardWithImport = (projectId, data, requestId, headers) =>
  http.post(`/projects/${projectId}/boards?requestId=${requestId}`, data, headers).then((body) => ({
    ...body,
    item: transformBoard(body.item),
  }));

const getBoard = (id, subscribe, headers) =>
  socket.get(`/boards/${id}${subscribe ? '?subscribe=true' : ''}`, undefined, headers).then((body) => ({
    ...body,
    item: transformBoard(body.item),
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      attachments: body.included.attachments.map(transformAttachment),
      tasks: body.included.tasks.map(transformTask),
      users: body.included.users.map(transformUser),
      lists: body.included.lists.map(transformList),
      mails: body.included.mails ? body.included.mails.map(transformMail) : [],
      projects: body.included.projects.map(transformProject),
    },
  }));

const updateBoard = (id, data, headers) =>
  socket.patch(`/boards/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformBoard(body.item),
  }));

const deleteBoard = (id, headers) =>
  socket.delete(`/boards/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformBoard(body.item),
  }));

const exportBoard = (id, data, headers) => socket.get(`/boards/${id}/export`, data, headers);

/* Event handlers */

const makeHandleBoardCreate = (next) => (body) => {
  next({
    ...body,
    item: transformBoard(body.item),
  });
};

const makeHandleBoardUpdate = makeHandleBoardCreate;

const makeHandleBoardDelete = makeHandleBoardCreate;

export default {
  createBoard,
  createBoardWithImport,
  getBoard,
  updateBoard,
  deleteBoard,
  exportBoard,
  makeHandleBoardCreate,
  makeHandleBoardUpdate,
  makeHandleBoardDelete,
};
