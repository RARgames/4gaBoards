import http from './http';
import socket from './socket';

/* Actions */

const createAccessToken = (data, headers) => http.post('/access-tokens', data, headers);

const getGoogleAuthUrl = (headers) => http.get('/google-sso', undefined, headers);

const deleteCurrentAccessToken = (headers) => socket.delete('/access-tokens/me', undefined, headers);

export default {
  createAccessToken,
  getGoogleAuthUrl,
  deleteCurrentAccessToken,
};
