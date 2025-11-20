import { connect } from 'react-redux';
import omit from 'lodash/omit';
import { bindActionCreators } from 'redux';

import CardModal from '../components/CardModal';
import { BoardMembershipRoles } from '../constants/Enums';
import Paths from '../constants/Paths';
import entryActions from '../entry-actions';
import { push } from '../lib/redux-router';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);
  const boardAndCardMemberships = selectors.selectBoardAndCardMembershipsForCurrentCard(state);
  const boardAndTaskMemberships = selectors.selectBoardAndTaskMembershipsForCurrentCard(state);
  const allLabels = selectors.selectLabelsForCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

  const {
    name,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isCommentsFetching,
    isAllCommentsFetched,
    boardId,
    listId,
    id,
    commentCount,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
  } = selectors.selectCurrentCard(state);

  const users = selectors.selectUsersForCurrentCard(state);
  const labels = selectors.selectLabelsForCurrentCard(state);
  const taskActivities = selectors.selectTaskActivitiesByCardId(state, id);
  const tasks = selectors.selectTasksForCurrentCard(state).map((task) => ({
    ...task,
    users: selectors.selectUsersForTaskById(state, task.id),
    activities: taskActivities[task.id] || [],
  }));
  const attachmentActivities = selectors.selectAttachmentActivitiesByCardId(state, id);
  const attachments = selectors.selectAttachmentsForCurrentCard(state).map((attachment) => ({
    ...attachment,
    activities: attachmentActivities[attachment.id] || [],
  }));
  const commentActivities = selectors.selectCommentActivitiesByCardId(state, id);
  const comments = selectors.selectCommentsForCurrentCard(state).map((comment) => ({
    ...comment,
    activities: commentActivities[comment.id] || [],
  }));
  const activities = selectors.selectActivitiesByCardId(state, id);
  const user = selectors.selectCurrentUser(state);
  const { commentMode, descriptionMode, descriptionShown, tasksShown, attachmentsShown, commentsShown, hideCardModalActivity, hideClosestDueDate, preferredDetailsFont } =
    selectors.selectCurrentUserPrefs(state);
  const userId = user.id;

  const { isGithubConnected, githubRepo } = selectors.selectCurrentBoard(state);

  let isCurrentUserEditor = false;
  let isCurrentUserEditorOrCanComment = false;

  if (currentUserMembership) {
    isCurrentUserEditor = currentUserMembership.role === BoardMembershipRoles.EDITOR;
    isCurrentUserEditorOrCanComment = isCurrentUserEditor || currentUserMembership.canComment;
  }
  const url = selectors.selectUrlForCard(state, id);
  const closestTaskDueDate = selectors.selectClosestTaskDueDateByCardId(state, id);
  const closestDueDate = selectors.selectClosestDueDateByCardId(state, id);

  return {
    name,
    id,
    description,
    dueDate,
    timer,
    isSubscribed,
    isActivitiesFetching,
    isAllActivitiesFetched,
    isCommentsFetching,
    isAllCommentsFetched,
    listId,
    boardId,
    projectId,
    users,
    labels,
    tasks,
    attachments,
    comments,
    activities,
    descriptionMode,
    descriptionShown,
    tasksShown,
    attachmentsShown,
    commentsShown,
    hideCardModalActivity,
    hideClosestDueDate,
    preferredDetailsFont,
    userId,
    isGithubConnected,
    githubRepo,
    allProjectsToLists,
    boardMemberships,
    boardAndCardMemberships,
    boardAndTaskMemberships,
    allLabels,
    commentCount,
    canEdit: isCurrentUserEditor,
    canEditCommentActivities: isCurrentUserEditorOrCanComment,
    canEditAllCommentActivities: isCurrentUserManager,
    commentMode,
    url,
    closestTaskDueDate,
    closestDueDate,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUserPrefsUpdate: entryActions.updateCurrentUserPrefs,
      onUpdate: entryActions.updateCurrentCard,
      onMove: entryActions.moveCurrentCard,
      onTransfer: entryActions.transferCurrentCard,
      onDuplicate: entryActions.duplicateCurrentCard,
      onDelete: entryActions.deleteCurrentCard,
      onUserAdd: entryActions.addUserToCurrentCard,
      onUserRemove: entryActions.removeUserFromCurrentCard,
      onBoardFetch: entryActions.fetchBoard,
      onLabelAdd: entryActions.addLabelToCurrentCard,
      onLabelRemove: entryActions.removeLabelFromCurrentCard,
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelDelete: entryActions.deleteLabel,
      onTaskCreate: entryActions.createTaskInCurrentCard,
      onTaskUpdate: entryActions.updateTask,
      onTaskDuplicate: entryActions.duplicateTask,
      onTaskMove: entryActions.moveTask,
      onTaskDelete: entryActions.deleteTask,
      onUserToTaskAdd: entryActions.addUserToTask,
      onUserFromTaskRemove: entryActions.removeUserFromTask,
      onAttachmentCreate: entryActions.createAttachmentInCurrentCard,
      onAttachmentUpdate: entryActions.updateAttachment,
      onAttachmentDelete: entryActions.deleteAttachment,
      onActivitiesFetch: entryActions.fetchActivitiesInCurrentCard,
      onCommentsFetch: entryActions.fetchCommentActivitiesInCurrentCard,
      onCommentActivityCreate: entryActions.createCommentActivityInCurrentCard,
      onCommentActivityUpdate: entryActions.updateCommentActivity,
      onCommentActivityDelete: entryActions.deleteCommentActivity,
      push,
    },
    dispatch,
  );

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...omit(dispatchProps, 'push'),
  onClose: () => dispatchProps.push(Paths.BOARDS.replace(':id', stateProps.boardId)),
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(CardModal);
