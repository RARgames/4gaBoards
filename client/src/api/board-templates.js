import socket from './socket';
import { transformBoardTemplate } from './transformers';

const getBoardTemplates = (headers) =>
  socket.get('/board-templates', undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformBoardTemplate),
  }));

const createBoardTemplate = (boardId, data, headers) =>
  socket.post(`/boards/${boardId}/templates`, data, headers).then((body) => ({
    ...body,
    item: transformBoardTemplate(body.item),
  }));

const updateBoardTemplate = (id, data, headers) =>
  socket.patch(`/board-templates/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformBoardTemplate(body.item),
  }));

const deleteBoardTemplate = (id, headers) =>
  socket.delete(`/board-templates/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformBoardTemplate(body.item),
  }));

const makeHandleBoardTemplateCreate = (next) => (body) => {
  next(body);
};

const makeHandleBoardTemplateUpdate = makeHandleBoardTemplateCreate;
const makeHandleBoardTemplateDelete = makeHandleBoardTemplateCreate;

export default {
  getBoardTemplates,
  createBoardTemplate,
  updateBoardTemplate,
  deleteBoardTemplate,
  makeHandleBoardTemplateCreate,
  makeHandleBoardTemplateUpdate,
  makeHandleBoardTemplateDelete,
};
