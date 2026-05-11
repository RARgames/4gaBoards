import socket from './socket';

/* Actions */

const getProjectMemberships = (headers) => socket.get(`/project-memberships`, undefined, headers);
const getProjectMembership = (projectId, headers) => socket.get(`/project-memberships/${projectId}`, undefined, headers);
const updateProjectMembership = (projectId, data, headers) => socket.patch(`/project-memberships/${projectId}`, data, headers);

export default {
  getProjectMemberships,
  getProjectMembership,
  updateProjectMembership,
};
