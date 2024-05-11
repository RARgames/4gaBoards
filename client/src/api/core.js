import http from './http';

/* Actions */

const getCoreSettingsPublic = (headers) => http.get('/core-settings-public', undefined, headers);

const updateCoreSettings = (data, headers) => http.post('/core-settings', data, headers);

export default {
  getCoreSettingsPublic,
  updateCoreSettings,
};
