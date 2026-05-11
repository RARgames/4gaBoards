import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* commentsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.COMMENTS_IN_CURRENT_CARD_FETCH, () => services.fetchCommentsInCurrentCard()),
    takeEvery(EntryActionTypes.COMMENTS_IN_CARD_FETCH, ({ payload: { cardId } }) => services.fetchCommentsInCard(cardId)),
    takeEvery(EntryActionTypes.COMMENT_IN_CURRENT_CARD_CREATE, ({ payload: { data } }) => services.createCommentInCurrentCard(data)),
    takeEvery(EntryActionTypes.COMMENT_UPDATE, ({ payload: { id, data } }) => services.updateComment(id, data)),
    takeEvery(EntryActionTypes.COMMENT_DELETE, ({ payload: { id } }) => services.deleteComment(id)),
    takeEvery(EntryActionTypes.COMMENT_CREATE_HANDLE, ({ payload: { comment } }) => services.handleCommentCreate(comment)),
    takeEvery(EntryActionTypes.COMMENT_UPDATE_HANDLE, ({ payload: { comment } }) => services.handleCommentUpdate(comment)),
    takeEvery(EntryActionTypes.COMMENT_DELETE_HANDLE, ({ payload: { comment } }) => services.handleCommentDelete(comment)),
  ]);
}
