import ActionTypes from '../constants/ActionTypes';

const fetchBoardTimeTotals = (boardId) => ({
  type: ActionTypes.BOARD_TIME_TOTALS_FETCH,
  payload: {
    boardId,
  },
});

fetchBoardTimeTotals.success = (boardId, items) => ({
  type: ActionTypes.BOARD_TIME_TOTALS_FETCH__SUCCESS,
  payload: {
    boardId,
    items,
  },
});

fetchBoardTimeTotals.failure = (boardId, error) => ({
  type: ActionTypes.BOARD_TIME_TOTALS_FETCH__FAILURE,
  payload: {
    boardId,
    error,
  },
});

export default {
  fetchBoardTimeTotals,
};
