import { put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import selectors from '../../../selectors';

// Shift-click extends the selection from the anchor to the clicked card. The range is taken in
// the list's *filtered* order — the order the user is actually looking at — and only when both
// ends live in the same list; anything else falls back to a plain toggle.
export function* toggleCardSelection(cardId, isRange) {
  if (isRange) {
    const { cardIds, anchorCardId } = yield select(selectors.selectCardSelection);

    if (anchorCardId && anchorCardId !== cardId) {
      const card = yield select(selectors.selectCardById, cardId);
      const anchorCard = yield select(selectors.selectCardById, anchorCardId);

      if (card && anchorCard && card.listId === anchorCard.listId) {
        const listCardIds = yield select(selectors.selectFilteredCardIdsByListId, card.listId);
        const anchorIndex = listCardIds.indexOf(anchorCardId);
        const targetIndex = listCardIds.indexOf(cardId);

        if (anchorIndex !== -1 && targetIndex !== -1) {
          const rangeCardIds = listCardIds.slice(Math.min(anchorIndex, targetIndex), Math.max(anchorIndex, targetIndex) + 1);
          const nextCardIds = [...cardIds, ...rangeCardIds.filter((id) => !cardIds.includes(id))];

          yield put(actions.setCardSelection(nextCardIds, cardId));
          return;
        }
      }
    }
  }

  yield put(actions.toggleCardSelection(cardId));
}

export function* clearCardSelection() {
  yield put(actions.clearCardSelection());
}

export default {
  toggleCardSelection,
  clearCardSelection,
};
