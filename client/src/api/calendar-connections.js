import socket from './socket';

/* Actions */

const getCalendarConnections = (headers) => socket.get('/calendar-connections', undefined, headers);

const getCalendarAuthorizeUrl = (headers) => socket.post('/calendar-connections/authorize-url', undefined, headers);

const deleteCalendarConnection = (id, headers) => socket.delete(`/calendar-connections/${id}`, undefined, headers);

export default {
  getCalendarConnections,
  getCalendarAuthorizeUrl,
  deleteCalendarConnection,
};
