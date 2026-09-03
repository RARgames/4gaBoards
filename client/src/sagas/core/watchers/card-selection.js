import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* cardSelectionWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CARD_SELECTION_TOGGLE, ({ payload: { cardId, isRange } }) => services.toggleCardSelection(cardId, isRange)),
    takeEvery(EntryActionTypes.CARD_SELECTION_CLEAR, () => services.clearCardSelection()),
  ]);
}
