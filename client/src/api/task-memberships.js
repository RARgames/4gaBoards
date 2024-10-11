import socket from './socket';

/* Actions */

const createTaskMembership = (taskId, data, headers) => socket.post(`/tasks/${taskId}/memberships`, data, headers);

const deleteTaskMembership = (taskId, userId, headers) => socket.delete(`/tasks/${taskId}/memberships?userId=${userId}`, undefined, headers);

export default {
  createTaskMembership,
  deleteTaskMembership,
};
