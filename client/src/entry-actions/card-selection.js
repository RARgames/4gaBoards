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

// Select-all for one column: adds every card the list is currently showing, or removes them
// again when they are already all selected.
const toggleListCardSelection = (listId) => ({
  type: EntryActionTypes.CARD_SELECTION_LIST_TOGGLE,
  payload: {
    listId,
  },
});

// Select-all for a group of cards the caller has already resolved — the done column's
// Today/Earlier-this-week/Older buckets, which only List.jsx knows the membership of.
const toggleCardsSelection = (cardIds) => ({
  type: EntryActionTypes.CARD_SELECTION_GROUP_TOGGLE,
  payload: {
    cardIds,
  },
});

const clearCardSelection = () => ({
  type: EntryActionTypes.CARD_SELECTION_CLEAR,
  payload: {},
});

export default {
  toggleCardSelection,
  toggleCardsSelection,
  toggleListCardSelection,
  clearCardSelection,
};
