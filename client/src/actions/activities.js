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

const fetchListActivities = (listId) => ({
  type: ActionTypes.ACTIVITIES_LIST_FETCH,
  payload: {
    listId,
  },
});

fetchListActivities.success = (listId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_LIST_FETCH__SUCCESS,
  payload: {
    listId,
    activities,
    users,
  },
});

fetchListActivities.failure = (listId, error) => ({
  type: ActionTypes.ACTIVITIES_LIST_FETCH__FAILURE,
  payload: {
    listId,
    error,
  },
});

const fetchBoardActivities = (boardId) => ({
  type: ActionTypes.ACTIVITIES_BOARD_FETCH,
  payload: {
    boardId,
  },
});

fetchBoardActivities.success = (boardId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_BOARD_FETCH__SUCCESS,
  payload: {
    boardId,
    activities,
    users,
  },
});

fetchBoardActivities.failure = (boardId, error) => ({
  type: ActionTypes.ACTIVITIES_BOARD_FETCH__FAILURE,
  payload: {
    boardId,
    error,
  },
});

const fetchProjectActivities = (projectId) => ({
  type: ActionTypes.ACTIVITIES_PROJECT_FETCH,
  payload: {
    projectId,
  },
});

fetchProjectActivities.success = (projectId, activities, users) => ({
  type: ActionTypes.ACTIVITIES_PROJECT_FETCH__SUCCESS,
  payload: {
    projectId,
    activities,
    users,
  },
});

fetchProjectActivities.failure = (projectId, error) => ({
  type: ActionTypes.ACTIVITIES_PROJECT_FETCH__FAILURE,
  payload: {
    projectId,
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
  fetchListActivities,
  fetchBoardActivities,
  fetchProjectActivities,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
