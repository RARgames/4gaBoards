import socket from './socket';

/* Actions */

const getUserPrefs = (id, headers) => socket.get(`/user-prefs/${id}`, undefined, headers);
const updateUserPrefs = (id, data, headers) => socket.patch(`/user-prefs/${id}`, data, headers);

export default {
  getUserPrefs,
  updateUserPrefs,
};
