import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import selectors from '../../../selectors';

export function* addPriorityToBoardFilter(id, boardId) {
  yield put(actions.addPriorityToBoardFilter(id, boardId));
}

export function* addPriorityToFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(addPriorityToBoardFilter, id, boardId);
}

export function* removePriorityFromBoardFilter(id, boardId) {
  yield put(actions.removePriorityFromBoardFilter(id, boardId));
}

export function* removePriorityFromFilterInCurrentBoard(id) {
  const { boardId } = yield select(selectors.selectPath);

  yield call(removePriorityFromBoardFilter, id, boardId);
}

export default {
  addPriorityToBoardFilter,
  addPriorityToFilterInCurrentBoard,
  removePriorityFromBoardFilter,
  removePriorityFromFilterInCurrentBoard,
};
