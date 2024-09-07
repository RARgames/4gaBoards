import ActionTypes from '../constants/ActionTypes';

const updateUserProject = (id, data) => ({
  type: ActionTypes.USER_PROJECT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateUserProject.success = (userProject) => ({
  type: ActionTypes.USER_PROJECT_UPDATE__SUCCESS,
  payload: {
    userProject,
  },
});

updateUserProject.failure = (id, error) => ({
  type: ActionTypes.USER_PROJECT_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleUserProjectUpdate = (userProject) => ({
  type: ActionTypes.USER_PROJECT_UPDATE_HANDLE,
  payload: {
    userProject,
  },
});

export default {
  updateUserProject,
  handleUserProjectUpdate,
};
