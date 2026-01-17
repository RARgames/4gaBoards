import EntryActionTypes from '../constants/EntryActionTypes';

const updateProjectMembership = (id, data) => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleProjectMembershipUpdate = (projectMembership) => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_UPDATE_HANDLE,
  payload: {
    projectMembership,
  },
});

export default {
  updateProjectMembership,
  handleProjectMembershipUpdate,
};
