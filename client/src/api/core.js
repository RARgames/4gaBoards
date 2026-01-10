import http from './http';
import socket from './socket';
import { transformCore } from './transformers';

/* Actions */

const getCoreSettingsPublic = (headers) =>
  http.get('/core-settings-public', undefined, headers).then((body) => ({
    ...body,
    item: transformCore(body.item),
  }));

const updateCoreSettings = (data, headers) =>
  socket.post('/core-settings', data, headers).then((body) => ({
    ...body,
    item: transformCore(body.item),
  }));

/* Event handlers */

const makeHandleCoreUpdate = (next) => (body) => {
  next({
    ...body,
    item: transformCore(body.item),
  });
};

export default {
  getCoreSettingsPublic,
  updateCoreSettings,
  makeHandleCoreUpdate,
};
