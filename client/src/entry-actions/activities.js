import EntryActionTypes from '../constants/EntryActionTypes';

const fetchAttachmentActivities = (attachmentId) => ({
  type: EntryActionTypes.ACTIVITIES_ATTACHMENT_FETCH,
  payload: {
    attachmentId,
  },
});

const fetchCommentActivities = (commentId) => ({
  type: EntryActionTypes.ACTIVITIES_COMMENT_FETCH,
  payload: {
    commentId,
  },
});

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

export default {
  fetchAttachmentActivities,
  fetchCommentActivities,
  fetchActivitiesInCurrentCard,
  fetchActivitiesInCard,
  fetchActivitiesInList,
  fetchActivitiesInBoard,
  fetchActivitiesInProject,
  handleActivityCreate,
};
