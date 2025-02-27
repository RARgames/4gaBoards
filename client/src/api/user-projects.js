import socket from './socket';

/* Actions */

const getUserProjects = (headers) => socket.get(`/user-projects`, undefined, headers);
const getUserProject = (projectId, headers) => socket.get(`/user-projects/${projectId}`, undefined, headers);
const updateUserProject = (projectId, data, headers) => socket.patch(`/user-projects/${projectId}`, data, headers);

export default {
  getUserProjects,
  getUserProject,
  updateUserProject,
};
