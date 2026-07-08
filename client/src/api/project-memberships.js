import socket from './socket';

/* Actions */

const createProjectMembership = (projectId, data, headers) => socket.post(`/projects/${projectId}/memberships`, data, headers);

const updateProjectMembership = (id, data, headers) => socket.patch(`/project-memberships/${id}`, data, headers);

const deleteProjectMembership = (id, headers) => socket.delete(`/project-memberships/${id}`, undefined, headers);

export default {
  createProjectMembership,
  updateProjectMembership,
  deleteProjectMembership,
};
