import { connect } from 'react-redux';
import omit from 'lodash/omit';
import { bindActionCreators } from 'redux';

import CardModal from '../components/CardModal';
import { BoardMembershipRoles } from '../constants/Enums';
import Paths from '../constants/Paths';
import Priorities, { getPriority } from '../constants/Priorities';
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
    startDate,
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
    priority: priorityValue,
    parentCardId,
  } = selectors.selectCurrentCard(state);

  const priority = getPriority(priorityValue) || null;
  const allPriorities = Priorities;

  const parent = parentCardId ? selectors.selectCardById(state, parentCardId) : null;
  const childCards = [];
  const candidateHeroes = [];
  const heroBoardListIds = selectors.selectListIdsForCurrentBoard(state) || [];
  heroBoardListIds.forEach((heroListId) => {
    const ids = selectors.selectCardIdsByListId(state, heroListId) || [];
    ids.forEach((cardId) => {
      if (cardId === id) return;
      const c = selectors.selectCardById(state, cardId);
      if (!c) return;
      if (c.parentCardId === id) {
        childCards.push({ id: c.id, name: c.name });
      } else if (c.parentCardId == null) {
        // Exclude cards that already have a parent — picking one would create grandparent nesting.
        candidateHeroes.push({ id: c.id, name: c.name });
      }
    });
  });
  // If this card already has children, it cannot also become a child (would create deep nesting).
  // Empty pickableHeroes still leaves the "None" option in the dropdown so an existing parent can be unset.
  const pickableHeroes = childCards.length > 0 ? [] : candidateHeroes;

  const users = selectors.selectUsersForCurrentCard(state);
  const labels = selectors.selectLabelsForCurrentCard(state);
  const taskActivities = selectors.selectTaskActivitiesByCardId(state, id);
  const tasks = selectors.selectTasksForCurrentCard(state).map((task) => ({
    ...task,
    users: selectors.selectUsersForTaskById(state, task.id),
    activities: taskActivities[task.id] || [],
    priority: getPriority(task.priority),
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
    startDate,
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
    priority,
    allPriorities,
    parent,
    childCards,
    pickableHeroes,
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
      onCardFetch: entryActions.fetchCard,
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
