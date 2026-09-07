import { call, put, select } from 'redux-saga/effects';

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

// Select-all over an arbitrary group of cards (a whole column, or one bucket of a done
// column): adds the ones that are missing, or drops the group again when it is already fully
// selected. Selecting leaves the group's last card as the anchor, so a following shift-click
// extends from the bottom of it.
export function* toggleCardsSelection(groupCardIds) {
  if (groupCardIds.length === 0) {
    return;
  }

  const { cardIds } = yield select(selectors.selectCardSelection);
  const isAllSelected = groupCardIds.every((id) => cardIds.includes(id));

  if (isAllSelected) {
    yield put(
      actions.setCardSelection(
        cardIds.filter((id) => !groupCardIds.includes(id)),
        null,
      ),
    );
    return;
  }

  yield put(actions.setCardSelection([...cardIds, ...groupCardIds.filter((id) => !cardIds.includes(id))], groupCardIds[groupCardIds.length - 1]));
}

// "All" for a column means the cards it is actually showing, so an active board filter narrows
// the select-all the same way it narrows the column itself.
export function* toggleListCardSelection(listId) {
  const listCardIds = yield select(selectors.selectFilteredCardIdsByListId, listId);

  yield call(toggleCardsSelection, listCardIds);
}

export function* clearCardSelection() {
  yield put(actions.clearCardSelection());
}

export default {
  toggleCardSelection,
  toggleCardsSelection,
  toggleListCardSelection,
  clearCardSelection,
};
