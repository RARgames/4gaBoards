import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* activitiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH, () => services.fetchActivitiesInCurrentCard()),
    takeEvery(EntryActionTypes.ACTIVITIES_CARD_FETCH, ({ payload: { cardId } }) => services.fetchActivitiesInCard(cardId)),
    takeEvery(EntryActionTypes.ACTIVITY_CREATE_HANDLE, ({ payload: { activity } }) => services.handleActivityCreate(activity)),
    takeEvery(EntryActionTypes.ACTIVITY_UPDATE_HANDLE, ({ payload: { activity } }) => services.handleActivityUpdate(activity)),
    takeEvery(EntryActionTypes.ACTIVITY_DELETE_HANDLE, ({ payload: { activity } }) => services.handleActivityDelete(activity)),
  ]);
}
