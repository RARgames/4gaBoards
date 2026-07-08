import ActionTypes from '../constants/ActionTypes';

const createProjectMembership = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE,
  payload: {
    projectMembership,
  },
});

createProjectMembership.success = (localId, projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE__SUCCESS,
  payload: {
    localId,
    projectMembership,
  },
});

createProjectMembership.failure = (localId, error) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleProjectMembershipCreate = (projectMembership, project, users, projectManagers, boards, boardMemberships, projectMemberships) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    projectMembership,
    project,
    users,
    projectManagers,
    boards,
    boardMemberships,
    projectMemberships,
  },
});

const updateProjectMembership = (id, data) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

updateProjectMembership.success = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_UPDATE__SUCCESS,
  payload: {
    projectMembership,
  },
});

updateProjectMembership.failure = (id, error) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleProjectMembershipUpdate = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    projectMembership,
  },
});

const deleteProjectMembership = (id) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

deleteProjectMembership.success = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE__SUCCESS,
  payload: {
    projectMembership,
  },
});

deleteProjectMembership.failure = (id, error, projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE__FAILURE,
  payload: {
    id,
    error,
    projectMembership,
  },
});

const handleProjectMembershipDelete = (projectMembership) => ({
  type: ActionTypes.PROJECT_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    projectMembership,
  },
});

export default {
  createProjectMembership,
  handleProjectMembershipCreate,
  updateProjectMembership,
  handleProjectMembershipUpdate,
  deleteProjectMembership,
  handleProjectMembershipDelete,
};
