import EntryActionTypes from '../constants/EntryActionTypes';

const createMembershipInProject = (id, data) => ({
  type: EntryActionTypes.MEMBERSHIP_IN_PROJECT_CREATE,
  payload: {
    id,
    data,
  },
});

const handleProjectMembershipCreate = (projectMembership) => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_CREATE_HANDLE,
  payload: {
    projectMembership,
  },
});

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

const deleteProjectMembership = (id) => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_DELETE,
  payload: {
    id,
  },
});

const handleProjectMembershipDelete = (projectMembership) => ({
  type: EntryActionTypes.PROJECT_MEMBERSHIP_DELETE_HANDLE,
  payload: {
    projectMembership,
  },
});

export default {
  createMembershipInProject,
  handleProjectMembershipCreate,
  updateProjectMembership,
  handleProjectMembershipUpdate,
  deleteProjectMembership,
  handleProjectMembershipDelete,
};
