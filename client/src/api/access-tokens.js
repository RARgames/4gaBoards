import http from './http';

/* Actions */

const createAccessToken = (data, headers) => http.post('/access-tokens', data, headers);

const getCurrentSession = () => http.get('/session');

const deleteCurrentAccessToken = (headers) => http.delete('/access-tokens/me', undefined, headers);

export default {
  createAccessToken,
  getCurrentSession,
  deleteCurrentAccessToken,
};
