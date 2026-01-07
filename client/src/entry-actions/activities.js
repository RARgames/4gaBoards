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

const fetchTaskActivities = (taskId) => ({
  type: EntryActionTypes.ACTIVITIES_TASK_FETCH,
  payload: {
    taskId,
  },
});

const fetchActivitiesInCurrentCard = () => ({
  type: EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH,
  payload: {},
});

const fetchCardActivities = (cardId) => ({
  type: EntryActionTypes.ACTIVITIES_CARD_FETCH,
  payload: {
    cardId,
  },
});

const fetchListActivities = (listId) => ({
  type: EntryActionTypes.ACTIVITIES_LIST_FETCH,
  payload: {
    listId,
  },
});

const fetchBoardActivities = (boardId) => ({
  type: EntryActionTypes.ACTIVITIES_BOARD_FETCH,
  payload: {
    boardId,
  },
});

const fetchProjectActivities = (projectId) => ({
  type: EntryActionTypes.ACTIVITIES_PROJECT_FETCH,
  payload: {
    projectId,
  },
});

const fetchUserActivities = (userId) => ({
  type: EntryActionTypes.ACTIVITIES_USER_FETCH,
  payload: {
    userId,
  },
});

const fetchUserAccountActivities = (userAccountId) => ({
  type: EntryActionTypes.ACTIVITIES_USER_ACCOUNT_FETCH,
  payload: {
    userAccountId,
  },
});

const fetchInstanceActivities = () => ({
  type: EntryActionTypes.ACTIVITIES_INSTANCE_FETCH,
  payload: {},
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
  fetchTaskActivities,
  fetchActivitiesInCurrentCard,
  fetchCardActivities,
  fetchListActivities,
  fetchBoardActivities,
  fetchProjectActivities,
  fetchUserActivities,
  fetchUserAccountActivities,
  fetchInstanceActivities,
  handleActivityCreate,
};
