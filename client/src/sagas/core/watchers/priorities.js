import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* prioritiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.PRIORITY_TO_FILTER_IN_CURRENT_BOARD_ADD, ({ payload: { id } }) => services.addPriorityToFilterInCurrentBoard(id)),
    takeEvery(EntryActionTypes.PRIORITY_FROM_FILTER_IN_CURRENT_BOARD_REMOVE, ({ payload: { id } }) => services.removePriorityFromFilterInCurrentBoard(id)),
  ]);
}
