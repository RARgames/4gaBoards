import ActionTypes from '../constants/ActionTypes';

const fetchCommentActivitiesCard = (cardId) => ({
  type: ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH,
  payload: {
    cardId,
  },
});

fetchCommentActivitiesCard.success = (cardId, activities, users) => ({
  type: ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH__SUCCESS,
  payload: {
    cardId,
    activities,
    users,
  },
});

fetchCommentActivitiesCard.failure = (cardId, error) => ({
  type: ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const createCommentActivity = (activity) => ({
  type: ActionTypes.COMMENT_ACTIVITY_CREATE,
  payload: {
    activity,
  },
});

createCommentActivity.success = (localId, activity) => ({
  type: ActionTypes.COMMENT_ACTIVITY_CREATE__SUCCESS,
  payload: {
    localId,
    activity,
  },
});

createCommentActivity.failure = (localId, error) => ({
  type: ActionTypes.COMMENT_ACTIVITY_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const updateCommentActivity = (id, data) => ({
  type: ActionTypes.COMMENT_ACTIVITY_UPDATE,
  payload: {
    id,
    data,
  },
});

updateCommentActivity.success = (activity) => ({
  type: ActionTypes.COMMENT_ACTIVITY_UPDATE__SUCCESS,
  payload: {
    activity,
  },
});

updateCommentActivity.failure = (id, error) => ({
  type: ActionTypes.COMMENT_ACTIVITY_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const deleteCommentActivity = (id) => ({
  type: ActionTypes.COMMENT_ACTIVITY_DELETE,
  payload: {
    id,
  },
});

deleteCommentActivity.success = (activity) => ({
  type: ActionTypes.COMMENT_ACTIVITY_DELETE__SUCCESS,
  payload: {
    activity,
  },
});

deleteCommentActivity.failure = (id, error) => ({
  type: ActionTypes.COMMENT_ACTIVITY_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

export default {
  fetchCommentActivitiesCard,
  createCommentActivity,
  updateCommentActivity,
  deleteCommentActivity,
};
