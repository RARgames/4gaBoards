import { createSelector } from 'reselect';

export const selectBoardTimeTotals = ({ ui }) => ui.boardTimeTotals.byCardId;

export const makeSelectCardTimeTotal = () =>
  createSelector(
    selectBoardTimeTotals,
    (_, id) => id,
    (byCardId, id) => byCardId[id] || null,
  );

export const selectCardTimeTotal = makeSelectCardTimeTotal();

export default {
  selectBoardTimeTotals,
  makeSelectCardTimeTotal,
  selectCardTimeTotal,
};
