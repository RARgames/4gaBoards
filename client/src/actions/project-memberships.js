import ActionTypes from '../constants/ActionTypes';

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

export default {
  updateProjectMembership,
  handleProjectMembershipUpdate,
};
