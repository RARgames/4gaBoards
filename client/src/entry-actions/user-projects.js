import EntryActionTypes from '../constants/EntryActionTypes';

const updateUserProject = (id, data) => ({
  type: EntryActionTypes.USER_PROJECT_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleUserProjectUpdate = (userProject) => ({
  type: EntryActionTypes.USER_PROJECT_UPDATE_HANDLE,
  payload: {
    userProject,
  },
});

export default {
  updateUserProject,
  handleUserProjectUpdate,
};
