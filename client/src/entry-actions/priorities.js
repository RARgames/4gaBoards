import EntryActionTypes from '../constants/EntryActionTypes';

const addPriorityToFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.PRIORITY_TO_FILTER_IN_CURRENT_BOARD_ADD,
  payload: {
    id,
  },
});

const removePriorityFromFilterInCurrentBoard = (id) => ({
  type: EntryActionTypes.PRIORITY_FROM_FILTER_IN_CURRENT_BOARD_REMOVE,
  payload: {
    id,
  },
});

export default {
  addPriorityToFilterInCurrentBoard,
  removePriorityFromFilterInCurrentBoard,
};
