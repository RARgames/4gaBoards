import socket from './socket';

/* Actions */

const getUserProjects = (headers) => socket.get(`/user-projects`, undefined, headers);
const updateUserProject = (projectId, data, headers) => socket.patch(`/user-projects/${projectId}`, data, headers);

export default {
  getUserProjects,
  updateUserProject,
};
