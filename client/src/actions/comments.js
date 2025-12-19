import ActionTypes from '../constants/ActionTypes';

const fetchCommentsInCard = (cardId) => ({
  type: ActionTypes.COMMENTS_IN_CARD_FETCH,
  payload: {
    cardId,
  },
});

fetchCommentsInCard.success = (cardId, comments, users) => ({
  type: ActionTypes.COMMENTS_IN_CARD_FETCH__SUCCESS,
  payload: {
    cardId,
    comments,
    users,
  },
});

fetchCommentsInCard.failure = (cardId, error) => ({
  type: ActionTypes.COMMENTS_IN_CARD_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const createComment = (comment) => ({
  type: ActionTypes.COMMENT_CREATE,
  payload: {
    comment,
  },
});

createComment.success = (localId, comment) => ({
  type: ActionTypes.COMMENT_CREATE__SUCCESS,
  payload: {
    localId,
    comment,
  },
});

createComment.failure = (localId, error) => ({
  type: ActionTypes.COMMENT_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const updateComment = (id, data) => ({
  type: ActionTypes.COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

updateComment.success = (comment) => ({
  type: ActionTypes.COMMENT_UPDATE__SUCCESS,
  payload: {
    comment,
  },
});

updateComment.failure = (id, error, comment) => ({
  type: ActionTypes.COMMENT_UPDATE__FAILURE,
  payload: {
    id,
    error,
    comment,
  },
});

const deleteComment = (id) => ({
  type: ActionTypes.COMMENT_DELETE,
  payload: {
    id,
  },
});

deleteComment.success = (comment) => ({
  type: ActionTypes.COMMENT_DELETE__SUCCESS,
  payload: {
    comment,
  },
});

deleteComment.failure = (id, error, comment) => ({
  type: ActionTypes.COMMENT_DELETE__FAILURE,
  payload: {
    id,
    error,
    comment,
  },
});

const handleCommentCreate = (comment) => ({
  type: ActionTypes.COMMENT_CREATE_HANDLE,
  payload: {
    comment,
  },
});

const handleCommentUpdate = (comment) => ({
  type: ActionTypes.COMMENT_UPDATE_HANDLE,
  payload: {
    comment,
  },
});

const handleCommentDelete = (comment) => ({
  type: ActionTypes.COMMENT_DELETE_HANDLE,
  payload: {
    comment,
  },
});

export default {
  fetchCommentsInCard,
  createComment,
  updateComment,
  deleteComment,
  handleCommentCreate,
  handleCommentUpdate,
  handleCommentDelete,
};
