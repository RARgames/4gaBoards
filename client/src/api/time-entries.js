import { fetch } from 'whatwg-fetch';

import Config from '../constants/Config';
import http from './http';
import socket from './socket';
import { transformTimeEntry } from './transformers';

/* Actions */

const previewTimeEntriesImport = (file, headers) => http.post('/time-entries/import', { file, mode: 'preview' }, headers);

const confirmTimeEntriesImport = (file, mapping, timezone, headers, extra = {}) => {
  const data = {
    file,
    mode: 'confirm',
    mapping: JSON.stringify(mapping),
    timezone,
  };

  if (extra.allMembers) {
    data.allMembers = 'true';
    data.memberMapping = JSON.stringify(extra.memberMapping);
  }

  return http.post('/time-entries/import', data, headers);
};

const exportTimeEntries = async (data, headers) => {
  const query = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const response = await fetch(`${Config.SERVER_BASE_URL}/api/time-entries/export?${query}`, {
    headers,
  });

  if (response.status !== 200) {
    const body = await response.json().catch(() => ({}));
    throw body;
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = /filename="?([^"]+)"?/.exec(disposition);

  return {
    blob,
    filename: match ? match[1] : 'timesheet.csv',
  };
};

const getTimeEntries = (data, headers) =>
  socket.get('/time-entries', data, headers).then((body) => ({
    ...body,
    items: body.items.map(transformTimeEntry),
  }));

const getTimeEntriesOverview = (data, headers) => socket.get('/time-entries/overview', data, headers);

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
  getTimeEntriesOverview,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  exportTimeEntries,
  previewTimeEntriesImport,
  confirmTimeEntriesImport,
  makeHandleTimeEntryCreate,
  makeHandleTimeEntryUpdate,
  makeHandleTimeEntryDelete,
};
