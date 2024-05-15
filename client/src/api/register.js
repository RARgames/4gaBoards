import http from './http';

/* Actions */

const register = (data, headers) => http.post('/register', data, headers);

export default {
  register,
};
