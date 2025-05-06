import { transformAttachment } from './attachments';
import { transformCard } from './cards';
import http from './http';
import socket from './socket';
import { transformTask } from './tasks';
import { transformUser } from './users';

/* Actions */

const createBoard = (projectId, data, headers) => socket.post(`/projects/${projectId}/boards`, data, headers);

const createBoardWithImport = (projectId, data, requestId, headers) => http.post(`/projects/${projectId}/boards?requestId=${requestId}`, data, headers);

const getBoard = (id, subscribe, headers) =>
  socket.get(`/boards/${id}${subscribe ? '?subscribe=true' : ''}`, undefined, headers).then((body) => ({
    ...body,
    included: {
      ...body.included,
      cards: body.included.cards.map(transformCard),
      attachments: body.included.attachments.map(transformAttachment),
      tasks: body.included.tasks.map(transformTask),
      users: body.included.users.map(transformUser),
    },
  }));

const updateBoard = (id, data, headers) => socket.patch(`/boards/${id}`, data, headers);

const deleteBoard = (id, headers) => socket.delete(`/boards/${id}`, undefined, headers);

const exportBoard = (id, headers) => socket.get(`/boards/${id}/export`, undefined, headers);

export default {
  createBoard,
  createBoardWithImport,
  getBoard,
  updateBoard,
  deleteBoard,
  exportBoard,
};
