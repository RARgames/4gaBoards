import ActionTypes from '../constants/ActionTypes';

const createBoardTemplate = (data) => ({
  type: ActionTypes.BOARD_TEMPLATE_CREATE,
  payload: {
    data,
  },
});

createBoardTemplate.success = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_CREATE__SUCCESS,
  payload: {
    boardTemplate,
  },
});

createBoardTemplate.failure = (error) => ({
  type: ActionTypes.BOARD_TEMPLATE_CREATE__FAILURE,
  payload: {
    error,
  },
});

const handleBoardTemplateCreate = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_CREATE_HANDLE,
  payload: {
    boardTemplate,
  },
});

const updateBoardTemplate = (id, data) => ({
  type: ActionTypes.BOARD_TEMPLATE_UPDATE,
  payload: {
    id,
    data,
  },
});

updateBoardTemplate.success = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_UPDATE__SUCCESS,
  payload: {
    boardTemplate,
  },
});

updateBoardTemplate.failure = (id, error) => ({
  type: ActionTypes.BOARD_TEMPLATE_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardTemplateUpdate = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_UPDATE_HANDLE,
  payload: {
    boardTemplate,
  },
});

const deleteBoardTemplate = (id) => ({
  type: ActionTypes.BOARD_TEMPLATE_DELETE,
  payload: {
    id,
  },
});

deleteBoardTemplate.success = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_DELETE__SUCCESS,
  payload: {
    boardTemplate,
  },
});

deleteBoardTemplate.failure = (id, error) => ({
  type: ActionTypes.BOARD_TEMPLATE_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleBoardTemplateDelete = (boardTemplate) => ({
  type: ActionTypes.BOARD_TEMPLATE_DELETE_HANDLE,
  payload: {
    boardTemplate,
  },
});

export default {
  createBoardTemplate,
  handleBoardTemplateCreate,
  updateBoardTemplate,
  handleBoardTemplateUpdate,
  deleteBoardTemplate,
  handleBoardTemplateDelete,
};
