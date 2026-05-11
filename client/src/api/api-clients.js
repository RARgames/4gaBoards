import socket from './socket';
import { transformApiClient } from './transformers';

/* Actions */

const getApiClients = (headers) =>
  socket.get(`/api-clients`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformApiClient),
  }));

const createApiClient = (data, headers) => {
  return socket.post(`/api-clients`, data, headers).then((body) => ({
    ...body,
    item: transformApiClient(body.item),
  }));
};

const updateApiClient = (id, data, headers) => {
  return socket.patch(`/api-clients/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformApiClient(body.item),
  }));
};

const deleteApiClient = (id, headers) =>
  socket.delete(`/api-clients/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformApiClient(body.item),
  }));

/* Event handlers */

const makeHandleApiClientCreate = (next) => (body) => {
  next({
    ...body,
    item: transformApiClient(body.item),
  });
};

const makeHandleApiClientUpdate = makeHandleApiClientCreate;
const makeHandleApiClientDelete = makeHandleApiClientCreate;

export default {
  getApiClients,
  createApiClient,
  updateApiClient,
  deleteApiClient,
  makeHandleApiClientCreate,
  makeHandleApiClientUpdate,
  makeHandleApiClientDelete,
};
