import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import request from '../request';

export function* fetchTimesheetOverview(params) {
  yield put(actions.fetchTimesheetOverview());

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let items;
  try {
    ({ items } = yield call(request, api.getTimeEntriesOverview, {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      timezone,
    }));
  } catch (error) {
    yield put(actions.fetchTimesheetOverview.failure(error));
    return;
  }

  yield put(actions.fetchTimesheetOverview.success(items));
}

export default {
  fetchTimesheetOverview,
};
