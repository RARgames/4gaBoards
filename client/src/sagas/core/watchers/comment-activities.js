import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* commentActivitiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.COMMENT_ACTIVITIES_IN_CURRENT_CARD_FETCH, () => services.fetchCommentActivitiesInCurrentCard()),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITIES_CARD_FETCH, ({ payload: { cardId } }) => services.fetchCommentActivitiesInCard(cardId)),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) => services.createCommentActivityInCurrentCard(data)),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_UPDATE, ({ payload: { id, data } }) => services.updateCommentActivity(id, data)),
    takeEvery(EntryActionTypes.COMMENT_ACTIVITY_DELETE, ({ payload: { id } }) => services.deleteCommentActivity(id)),
  ]);
}
