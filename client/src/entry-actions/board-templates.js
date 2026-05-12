import EntryActionTypes from '../constants/EntryActionTypes';

const createBoardTemplate = (boardId, data) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_CREATE,
  payload: {
    boardId,
    data,
  },
});

const handleBoardTemplateCreate = (boardTemplate) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_CREATE_HANDLE,
  payload: {
    boardTemplate,
  },
});

const updateBoardTemplate = (id, data) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleBoardTemplateUpdate = (boardTemplate) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_UPDATE_HANDLE,
  payload: {
    boardTemplate,
  },
});

const deleteBoardTemplate = (id) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_DELETE,
  payload: {
    id,
  },
});

const handleBoardTemplateDelete = (boardTemplate) => ({
  type: EntryActionTypes.BOARD_TEMPLATE_DELETE_HANDLE,
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
