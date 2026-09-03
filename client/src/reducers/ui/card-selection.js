import ActionTypes from '../../constants/ActionTypes';

// Board multi-select. `anchorCardId` is the last card whose checkbox was clicked — shift-click
// selects the range between it and the newly clicked card (see sagas/core/services/card-selection).
const initialState = {
  cardIds: [],
  anchorCardId: null,
};

// eslint-disable-next-line default-param-last
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ActionTypes.CARD_SELECTION_TOGGLE: {
      const isSelected = state.cardIds.includes(payload.cardId);

      return {
        cardIds: isSelected ? state.cardIds.filter((cardId) => cardId !== payload.cardId) : [...state.cardIds, payload.cardId],
        anchorCardId: isSelected ? null : payload.cardId,
      };
    }
    case ActionTypes.CARD_SELECTION_SET:
      return {
        cardIds: payload.cardIds,
        anchorCardId: payload.anchorCardId,
      };
    case ActionTypes.CARD_SELECTION_CLEAR:
      return initialState;
    // A selected card that left the board (deleted, archived or moved away by anyone) must not
    // linger in the selection, or the toolbar would keep acting on an id that no longer exists.
    case ActionTypes.CARD_DELETE:
    case ActionTypes.CARD_ARCHIVE: {
      if (!state.cardIds.includes(payload.id)) {
        return state;
      }

      return {
        cardIds: state.cardIds.filter((cardId) => cardId !== payload.id),
        anchorCardId: state.anchorCardId === payload.id ? null : state.anchorCardId,
      };
    }
    case ActionTypes.CARD_DELETE__SUCCESS:
    case ActionTypes.CARD_DELETE_HANDLE: {
      if (!state.cardIds.includes(payload.card.id)) {
        return state;
      }

      return {
        cardIds: state.cardIds.filter((cardId) => cardId !== payload.card.id),
        anchorCardId: state.anchorCardId === payload.card.id ? null : state.anchorCardId,
      };
    }
    default:
      return state;
  }
};
