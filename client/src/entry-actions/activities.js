import EntryActionTypes from '../constants/EntryActionTypes';

const fetchActivitiesInCurrentCard = () => ({
  type: EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const fetchActivitiesInCard = (cardId) => ({
  type: EntryActionTypes.ACTIVITIES_CARD_FETCH,
  payload: {
    cardId,
  },
});

const fetchActivitiesInList = (listId) => ({
  type: EntryActionTypes.ACTIVITIES_LIST_FETCH,
  payload: {
    listId,
  },
});

const fetchActivitiesInBoard = (boardId) => ({
  type: EntryActionTypes.ACTIVITIES_BOARD_FETCH,
  payload: {
    boardId,
  },
});

const fetchActivitiesInProject = (projectId) => ({
  type: EntryActionTypes.ACTIVITIES_PROJECT_FETCH,
  payload: {
    projectId,
  },
});

const handleActivityCreate = (activity) => ({
  type: EntryActionTypes.ACTIVITY_CREATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityUpdate = (activity) => ({
  type: EntryActionTypes.ACTIVITY_UPDATE_HANDLE,
  payload: {
    activity,
  },
});

const handleActivityDelete = (activity) => ({
  type: EntryActionTypes.ACTIVITY_DELETE_HANDLE,
  payload: {
    activity,
  },
});

export default {
  fetchActivitiesInCurrentCard,
  fetchActivitiesInCard,
  fetchActivitiesInList,
  fetchActivitiesInBoard,
  fetchActivitiesInProject,
  handleActivityCreate,
  handleActivityUpdate,
  handleActivityDelete,
};
