import ActionTypes from '../constants/ActionTypes';

const fetchCardActivities = (cardId) => ({
  type: ActionTypes.ACTIVITIES_CARD_FETCH,
  payload: {
    cardId,
  },
});

fetchCardActivities.success = (cardId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_CARD_FETCH__SUCCESS,
  payload: {
    cardId,
    activities,
    users,
  },
});

fetchCardActivities.failure = (cardId, error) => ({
  type: ActionTypes.ACTIVITIES_CARD_FETCH__FAILURE,
  payload: {
    cardId,
    error,
  },
});

const handleActivityCreate = (activity) => ({
  type: ActionTypes.ACTIVITY_CREATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityUpdate = (activity) => ({
  type: ActionTypes.ACTIVITY_UPDATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityDelete = (activity) => ({
  type: ActionTypes.ACTIVITY_DELETE_HANDLE,
  payload: {
    activity,
  },
});

export default {
  fetchCardActivities,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
