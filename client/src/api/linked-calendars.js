import socket from './socket';

/* Actions */

const getLinkedCalendars = (headers) => socket.get('/linked-calendars', undefined, headers);

const createLinkedCalendar = (data, headers) => socket.post('/linked-calendars', data, headers);

const updateLinkedCalendar = (id, data, headers) => socket.patch(`/linked-calendars/${id}`, data, headers);

const deleteLinkedCalendar = (id, headers) => socket.delete(`/linked-calendars/${id}`, undefined, headers);

const getConnectionCalendars = (connectionId, headers) => socket.get(`/calendar-connections/${connectionId}/calendars`, undefined, headers);

export default {
  getLinkedCalendars,
  createLinkedCalendar,
  updateLinkedCalendar,
  deleteLinkedCalendar,
  getConnectionCalendars,
};
