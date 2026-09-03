import ActionTypes from '../constants/ActionTypes';

// Multi-select on the board is pure UI state (reducers/ui/card-selection.js) — no server round
// trip, so these are dispatched straight from the selection saga without success/failure pairs.
const toggleCardSelection = (cardId) => ({
  type: ActionTypes.CARD_SELECTION_TOGGLE,
  payload: {
    cardId,
  },
});

const setCardSelection = (cardIds, anchorCardId) => ({
  type: ActionTypes.CARD_SELECTION_SET,
  payload: {
    cardIds,
    anchorCardId,
  },
});

const clearCardSelection = () => ({
  type: ActionTypes.CARD_SELECTION_CLEAR,
  payload: {},
});

export default {
  toggleCardSelection,
  setCardSelection,
  clearCardSelection,
};
