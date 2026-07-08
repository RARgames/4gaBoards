import http from './http';
import socket from './socket';
import { transformDocument } from './transformers';

/* Actions */

const getDocuments = (projectId, headers) =>
  socket.get(`/projects/${projectId}/documents`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformDocument),
  }));

const createDocument = (projectId, data, headers) =>
  http.post(`/projects/${projectId}/documents`, data, headers).then((body) => ({
    ...body,
    item: transformDocument(body.item),
  }));

const updateDocument = (id, data, headers) =>
  socket.patch(`/documents/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformDocument(body.item),
  }));

const deleteDocument = (id, headers) =>
  socket.delete(`/documents/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformDocument(body.item),
  }));

/* Event handlers */

const makeHandleDocumentCreate = (next) => (body) => {
  next({
    ...body,
    item: transformDocument(body.item),
  });
};

const makeHandleDocumentUpdate = makeHandleDocumentCreate;

const makeHandleDocumentDelete = makeHandleDocumentCreate;

export default {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  makeHandleDocumentCreate,
  makeHandleDocumentUpdate,
  makeHandleDocumentDelete,
};
