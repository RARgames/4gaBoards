import http from './http';
import socket from './socket';
import { transformAttachment, transformBoard, transformProject, transformCard, transformList, transformTask, transformUser } from './transformers';

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

// Lightweight `[{ id, name }]` for cards on a board — used by the cross-board card-link
// picker so we don't have to fetch the entire target board's payload just to enumerate cards.
const getBoardCardsSummary = (id, headers) => socket.get(`/boards/${id}/cards-summary`, undefined, headers);
const getBoardTimeTotals = (id, headers) => socket.get(`/boards/${id}/time-totals`, undefined, headers);

// §5.4/§6.4: cards past their list's auto-archive delay (or manually archived). Grouping and
// filtering happen client-side on the returned set (ArchiveView), same as the approved mockup.
const getBoardArchivedCards = (id, headers) =>
  socket.get(`/boards/${id}/archived-cards`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
  }));

// Re-homes a column's archived cards onto another column without un-archiving them, so an old
// column can be deleted without stranding the cards behind it. `fromListId` may name a column
// that is already gone — that is the salvage path for cards orphaned by an earlier delete.
const moveBoardArchivedCards = (id, data, headers) =>
  socket.post(`/boards/${id}/move-archived-cards`, data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformCard),
  }));

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
  getBoardCardsSummary,
  getBoardTimeTotals,
  getBoardArchivedCards,
  moveBoardArchivedCards,
  makeHandleBoardCreate,
  makeHandleBoardUpdate,
  makeHandleBoardDelete,
};
