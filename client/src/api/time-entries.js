import socket from './socket';
import { transformTimeEntry } from './transformers';

/* Actions */

const getTimeEntries = (data, headers) =>
  socket.get('/time-entries', data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformTimeEntry),
  }));

const createTimeEntry = (data, headers) =>
  socket.post('/time-entries', data, headers).then((body) => ({
    ...body,
    item: transformTimeEntry(body.item),
  }));

const updateTimeEntry = (id, data, headers) =>
  socket.patch(`/time-entries/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformTimeEntry(body.item),
  }));

const deleteTimeEntry = (id, headers) =>
  socket.delete(`/time-entries/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformTimeEntry(body.item),
  }));

/* Event handlers */

const makeHandleTimeEntryCreate = (next) => (body) => {
  next({
    ...body,
    item: transformTimeEntry(body.item),
  });
};

const makeHandleTimeEntryUpdate = makeHandleTimeEntryCreate;

const makeHandleTimeEntryDelete = makeHandleTimeEntryCreate;

export default {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  makeHandleTimeEntryCreate,
  makeHandleTimeEntryUpdate,
  makeHandleTimeEntryDelete,
};
