import ActionTypes from '../../constants/ActionTypes';

// Keyed by board so switching boards doesn't show the previous board's figures
// while the new ones are in flight.
const initialState = {
  boardId: null,
  isFetching: false,
  byCardId: {},
  error: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.BOARD_TIME_TOTALS_FETCH:
      return {
        ...state,
        boardId: payload.boardId,
        isFetching: true,
        byCardId: payload.boardId === state.boardId ? state.byCardId : {},
        error: null,
      };
    case ActionTypes.BOARD_TIME_TOTALS_FETCH__SUCCESS:
      if (payload.boardId !== state.boardId) {
        return state;
      }

      return {
        ...state,
        isFetching: false,
        byCardId: payload.items.reduce(
          (acc, item) => ({
            ...acc,
            [item.cardId]: { totalMinutes: item.totalMinutes, lastEntryAt: item.lastEntryAt },
          }),
          {},
        ),
      };
    case ActionTypes.BOARD_TIME_TOTALS_FETCH__FAILURE:
      if (payload.boardId !== state.boardId) {
        return state;
      }

      return {
        ...state,
        isFetching: false,
        error: payload.error,
      };
    default:
      return state;
  }
};
