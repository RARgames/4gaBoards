import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* activitiesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.ACTIVITIES_ATTACHMENT_FETCH, ({ payload: { attachmentId } }) => services.fetchAttachmentActivities(attachmentId)),
    takeEvery(EntryActionTypes.ACTIVITIES_COMMENT_FETCH, ({ payload: { commentId } }) => services.fetchCommentActivities(commentId)),
    takeEvery(EntryActionTypes.ACTIVITIES_TASK_FETCH, ({ payload: { taskId } }) => services.fetchTaskActivities(taskId)),
    takeEvery(EntryActionTypes.ACTIVITIES_IN_CURRENT_CARD_FETCH, () => services.fetchActivitiesInCurrentCard()),
    takeEvery(EntryActionTypes.ACTIVITIES_CARD_FETCH, ({ payload: { cardId } }) => services.fetchActivitiesInCard(cardId)),
    takeEvery(EntryActionTypes.ACTIVITIES_LIST_FETCH, ({ payload: { listId } }) => services.fetchActivitiesInList(listId)),
    takeEvery(EntryActionTypes.ACTIVITIES_BOARD_FETCH, ({ payload: { boardId } }) => services.fetchActivitiesInBoard(boardId)),
    takeEvery(EntryActionTypes.ACTIVITIES_PROJECT_FETCH, ({ payload: { projectId } }) => services.fetchActivitiesInProject(projectId)),
    takeEvery(EntryActionTypes.ACTIVITIES_USER_FETCH, ({ payload: { userId } }) => services.fetchUserActivities(userId)),
    takeEvery(EntryActionTypes.ACTIVITIES_USER_ACCOUNT_FETCH, ({ payload: { userAccountId } }) => services.fetchUserAccountActivities(userAccountId)),
    takeEvery(EntryActionTypes.ACTIVITIES_INSTANCE_FETCH, () => services.fetchInstanceActivities()),
    takeEvery(EntryActionTypes.ACTIVITY_CREATE_HANDLE, ({ payload: { activity } }) => services.handleActivityCreate(activity)),
  ]);
}
