import EntryActionTypes from '../constants/EntryActionTypes';

// `isRange` is shift-click: the saga expands the selection from the last-clicked anchor to this
// card, using the order of the list the two cards share.
const toggleCardSelection = (cardId, isRange = false) => ({
  type: EntryActionTypes.CARD_SELECTION_TOGGLE,
  payload: {
    cardId,
    isRange,
  },
});

const clearCardSelection = () => ({
  type: EntryActionTypes.CARD_SELECTION_CLEAR,
  payload: {},
});

export default {
  toggleCardSelection,
  clearCardSelection,
};
