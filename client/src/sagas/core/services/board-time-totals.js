import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

// One request per board rather than one per card: see boards/time-totals on the
// server for why cards/:id/time-entries is the wrong shape here.
export function* fetchBoardTimeTotals(boardId) {
  yield put(actions.fetchBoardTimeTotals(boardId));

  let items;
  try {
    ({ items } = yield call(request, api.getBoardTimeTotals, boardId));
  } catch (error) {
    yield put(actions.fetchBoardTimeTotals.failure(boardId, error));
    return;
  }

  yield put(actions.fetchBoardTimeTotals.success(boardId, items));
}

export default {
  fetchBoardTimeTotals,
};
