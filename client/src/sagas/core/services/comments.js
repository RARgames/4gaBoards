import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* fetchCommentsInCard(cardId) {
  const lastId = yield select(selectors.selectLastCommentIdByCardId, cardId);

  yield put(actions.fetchCommentsInCard(cardId));

  let comments;
  let users;

  try {
    ({
      items: comments,
      included: { users },
    } = yield call(request, api.getCardComments, cardId, { beforeId: lastId }));
  } catch (error) {
    yield put(actions.fetchCommentsInCard.failure(cardId, error));
    return;
  }

  yield put(actions.fetchCommentsInCard.success(cardId, comments, users));
}

export function* fetchCommentsInCurrentCard() {
  const { cardId } = yield select(selectors.selectPath);

  yield call(fetchCommentsInCard, cardId);
}

export function* createComment(cardId, data) {
  const localId = yield call(createLocalId);
  const userId = yield select(selectors.selectCurrentUserId);

  yield put(
    actions.createComment({
      cardId,
      userId,
      data,
      id: localId,
    }),
  );

  let comment;
  try {
    ({ item: comment } = yield call(request, api.createComment, cardId, data));
  } catch (error) {
    yield put(actions.createComment.failure(localId, error));
    return;
  }

  yield put(actions.createComment.success(localId, comment));
}

export function* createCommentInCurrentCard(data) {
  const { cardId } = yield select(selectors.selectPath);

  yield call(createComment, cardId, data);
}

export function* updateComment(id, data) {
  const originalComment = yield select(selectors.selectCommentById, id);

  yield put(actions.updateComment(id, data));
  let comment;
  try {
    ({ item: comment } = yield call(request, api.updateComment, id, data));
  } catch (error) {
    yield put(actions.updateComment.failure(id, error, originalComment));
    return;
  }

  yield put(actions.updateComment.success(comment));
}

export function* deleteComment(id) {
  const originalComment = yield select(selectors.selectCommentById, id);

  yield put(actions.deleteComment(id));
  let comment;
  try {
    ({ item: comment } = yield call(request, api.deleteComment, id));
  } catch (error) {
    yield put(actions.deleteComment.failure(id, error, originalComment));
    return;
  }

  yield put(actions.deleteComment.success(comment));
}

export function* handleCommentCreate(comment) {
  yield put(actions.handleCommentCreate(comment));
}

export function* handleCommentUpdate(comment) {
  yield put(actions.handleCommentUpdate(comment));
}

export function* handleCommentDelete(comment) {
  yield put(actions.handleCommentDelete(comment));
}

export default {
  fetchCommentsInCard,
  fetchCommentsInCurrentCard,
  createComment,
  createCommentInCurrentCard,
  updateComment,
  deleteComment,
  handleCommentCreate,
  handleCommentUpdate,
  handleCommentDelete,
};
