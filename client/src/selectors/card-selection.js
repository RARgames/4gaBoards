export const selectCardSelection = ({ ui: { cardSelection } }) => cardSelection;

export const selectSelectedCardIds = ({ ui: { cardSelection } }) => cardSelection.cardIds;

export default {
  selectCardSelection,
  selectSelectedCardIds,
};
