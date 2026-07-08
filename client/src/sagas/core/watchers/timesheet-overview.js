import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* timesheetOverviewWatchers() {
  yield all([takeEvery(EntryActionTypes.TIMESHEET_OVERVIEW_FETCH, ({ payload: { params } }) => services.fetchTimesheetOverview(params))]);
}
