import socket from './socket';

/* Actions */

const getMembersOverview = (headers) => socket.get('/members-overview', undefined, headers);

export default {
  getMembersOverview,
};
