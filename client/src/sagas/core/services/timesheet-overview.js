import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { getEffectiveTimeZone } from '../../../utils/timezone';
import request from '../request';

export function* fetchTimesheetOverview(params) {
  yield put(actions.fetchTimesheetOverview());

  const userPrefs = yield select(selectors.selectCurrentUserPrefs);
  const timezone = getEffectiveTimeZone(userPrefs && userPrefs.timezone);

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
