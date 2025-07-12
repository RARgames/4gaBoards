import EntryActionTypes from '../constants/EntryActionTypes';

const fetchCommentActivitiesInCurrentCard = () => ({
  type: EntryActionTypes.COMMENT_ACTIVITIES_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const fetchCommentActivitiesInCard = (cardId) => ({
  type: EntryActionTypes.COMMENT_ACTIVITIES_CARD_FETCH,
  payload: {
    cardId,
  },
});

const createCommentActivityInCurrentCard = (data) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_IN_CURRENT_CARD_CREATE,
  payload: {
    data,
  },
});

const updateCommentActivity = (id, data) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_UPDATE,
  payload: {
    id,
    data,
  },
});

const deleteCommentActivity = (id) => ({
  type: EntryActionTypes.COMMENT_ACTIVITY_DELETE,
  payload: {
    id,
  },
});

export default {
  fetchCommentActivitiesInCurrentCard,
  fetchCommentActivitiesInCard,
  createCommentActivityInCurrentCard,
  updateCommentActivity,
  deleteCommentActivity,
};
