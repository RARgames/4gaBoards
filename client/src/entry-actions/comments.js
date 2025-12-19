import EntryActionTypes from '../constants/EntryActionTypes';

const fetchCommentsInCurrentCard = () => ({
  type: EntryActionTypes.COMMENTS_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const fetchCommentsInCard = (cardId) => ({
  type: EntryActionTypes.COMMENTS_IN_CARD_FETCH,
  payload: {
    cardId,
  },
});

const createCommentInCurrentCard = (data) => ({
  type: EntryActionTypes.COMMENT_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const updateComment = (id, data) => ({
  type: EntryActionTypes.COMMENT_UPDATE,
  payload: {
    id,
    data,
  },
});

const deleteComment = (id) => ({
  type: EntryActionTypes.COMMENT_DELETE,
  payload: {
    id,
  },
});

const handleCommentCreate = (comment) => ({
  type: EntryActionTypes.COMMENT_CREATE_HANDLE,
  payload: {
    comment,
  },
});

const handleCommentUpdate = (comment) => ({
  type: EntryActionTypes.COMMENT_UPDATE_HANDLE,
  payload: {
    comment,
  },
});

const handleCommentDelete = (comment) => ({
  type: EntryActionTypes.COMMENT_DELETE_HANDLE,
  payload: {
    comment,
  },
});

export default {
  fetchCommentsInCurrentCard,
  fetchCommentsInCard,
  createCommentInCurrentCard,
  updateComment,
  deleteComment,
  handleCommentCreate,
  handleCommentUpdate,
  handleCommentDelete,
};
