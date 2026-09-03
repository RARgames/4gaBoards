import socket from './socket';

/* Actions */

const getCalendarEvents = (projectId, data, headers) => socket.get(`/projects/${projectId}/calendar-events`, data, headers);

export default {
  getCalendarEvents,
};
