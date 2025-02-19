import http from './http';
import socket from './socket';

/* Actions */

const getCoreSettingsPublic = (headers) => http.get('/core-settings-public', undefined, headers);

const updateCoreSettings = (data, headers) => socket.post('/core-settings', data, headers);

export default {
  getCoreSettingsPublic,
  updateCoreSettings,
};
