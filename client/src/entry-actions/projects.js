import EntryActionTypes from '../constants/EntryActionTypes';

const createProject = (data) => ({
  type: EntryActionTypes.PROJECT_CREATE,
  payload: {
    data,
  },
});

const handleProjectCreate = (project) => ({
  type: EntryActionTypes.PROJECT_CREATE_HANDLE,
  payload: {
    project,
  },
});

const updateProject = (id, data) => ({
  type: EntryActionTypes.PROJECT_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentProject = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_UPDATE,
  payload: {
    data,
  },
});

const handleProjectUpdate = (project) => ({
  type: EntryActionTypes.PROJECT_UPDATE_HANDLE,
  payload: {
    project,
  },
});

const updateProjectBackgroundImage = (id, data) => ({
  type: EntryActionTypes.PROJECT_BACKGROUND_IMAGE_UPDATE,
  payload: {
    id,
    data,
  },
});

const updateCurrentProjectBackgroundImage = (data) => ({
  type: EntryActionTypes.CURRENT_PROJECT_BACKGROUND_IMAGE_UPDATE,
  payload: {
    data,
  },
});

const deleteProject = (id) => ({
  type: EntryActionTypes.PROJECT_DELETE,
  payload: {
    id,
  },
});

const deleteCurrentProject = () => ({
  type: EntryActionTypes.CURRENT_PROJECT_DELETE,
  payload: {},
});

const handleProjectDelete = (project) => ({
  type: EntryActionTypes.PROJECT_DELETE_HANDLE,
  payload: {
    project,
  },
});

const importGettingStartedProject = (data, userRequested) => ({
  type: EntryActionTypes.PROJECT_IMPORT_GETTING_STARTED,
  payload: {
    data,
    userRequested,
  },
});

export default {
  createProject,
  handleProjectCreate,
  updateProject,
  updateCurrentProject,
  handleProjectUpdate,
  updateProjectBackgroundImage,
  updateCurrentProjectBackgroundImage,
  deleteProject,
  deleteCurrentProject,
  handleProjectDelete,
  importGettingStartedProject,
};
