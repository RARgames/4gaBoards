import ActionTypes from '../constants/ActionTypes';

const addPriorityToBoardFilter = (id, boardId) => ({
  type: ActionTypes.PRIORITY_TO_BOARD_FILTER_ADD,
  payload: {
    id,
    boardId,
  },
});

const removePriorityFromBoardFilter = (id, boardId) => ({
  type: ActionTypes.PRIORITY_FROM_BOARD_FILTER_REMOVE,
  payload: {
    id,
    boardId,
  },
});

export default {
  addPriorityToBoardFilter,
  removePriorityFromBoardFilter,
};
