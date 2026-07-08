import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* membersOverviewWatchers() {
  yield all([takeEvery(EntryActionTypes.MEMBERS_OVERVIEW_FETCH, () => services.fetchMembersOverview())]);
}
