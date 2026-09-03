import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Card from '../components/Card';
import { BoardMembershipRoles } from '../constants/Enums';
import { getPriority } from '../constants/Priorities';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectCardById = selectors.makeSelectCardById();
  const selectUsersByCardId = selectors.makeSelectUsersByCardId();
  const selectLabelsByCardId = selectors.makeSelectLabelsByCardId();
  const selectDetailedTasksByCardId = selectors.makeSelectDetailedTasksByCardId();
  const selectNotificationsTotalByCardId = selectors.makeSelectNotificationsTotalByCardId();
  const selectAttachmentsCountByCardId = selectors.makeSelectAttachmentsCountByCardId();
  const selectClosestDueDateByCardId = selectors.makeSelectClosestTaskDueDateByCardId();
  const selectChildrenCountByCardId = selectors.makeSelectChildrenCountByCardId();
  const selectParentCardByCardId = selectors.makeSelectParentCardByCardId();
  const selectIsBlockedByCardId = selectors.makeSelectIsBlockedByCardId();
  const selectListById = selectors.makeSelectListById();
  const selectBoardAndCardMembershipsByCardId = selectors.makeSelectBoardAndCardMembershipsByCardId();
  const selectBoardAndTaskMembershipsByCardId = selectors.makeSelectBoardAndTaskMembershipsByCardId();
  const selectActivitiesByCardId = selectors.makeSelectActivitiesByCardId();

  return (state, { id, index }) => {
    const currentCardId = selectors.selectPath(state).cardId;
    const isOpen = currentCardId === id;

    const { projectId } = selectors.selectPath(state);
    const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const boardAndCardMemberships = selectBoardAndCardMembershipsByCardId(state, id);
    const boardAndTaskMemberships = selectBoardAndTaskMembershipsByCardId(state, id);
    const allLabels = selectors.selectLabelsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const {
      name,
      dueDate,
      timer,
      coverUrl,
      description,
      boardId,
      listId,
      completedAt,
      isPersisted,
      commentCount,
      isActivitiesFetching,
      isAllActivitiesFetched,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      priority: priorityValue,
    } = selectCardById(state, id);

    const priority = getPriority(priorityValue) || null;
    const parent = selectParentCardByCardId(state, id);
    const childrenCount = selectChildrenCountByCardId(state, id);
    const isBlocked = selectIsBlockedByCardId(state, id);
    // §6.2: the Done card treatment is gated on the parent list's type, the same shape as
    // isBlocked above — threaded down as a plain prop rather than recomputed inside Card.jsx.
    const { type: listType, autoArchiveDays: listAutoArchiveDays } = selectListById(state, listId) || {};

    const users = selectUsersByCardId(state, id);
    const labels = selectLabelsByCardId(state, id);
    const tasks = selectDetailedTasksByCardId(state, id);
    const notificationsTotal = selectNotificationsTotalByCardId(state, id);
    const attachmentsCount = selectAttachmentsCountByCardId(state, id);
    const closestDueDate = selectClosestDueDateByCardId(state, id);

    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const selectedCardIds = selectors.selectSelectedCardIds(state);
    const url = selectors.selectUrlForCard(state, id);
    const activities = selectActivitiesByCardId(state, id);

    return {
      id,
      index,
      name,
      dueDate,
      timer,
      coverUrl,
      boardId,
      listId,
      listType,
      listAutoArchiveDays,
      completedAt,
      projectId,
      isPersisted,
      isOpen,
      notificationsTotal,
      users,
      labels,
      tasks,
      description,
      attachmentsCount,
      commentCount,
      priority,
      parent,
      childrenCount,
      isBlocked,
      boardMemberships,
      boardAndCardMemberships,
      boardAndTaskMemberships,
      allLabels,
      canEdit: isCurrentUserEditor,
      url,
      activities,
      isActivitiesFetching,
      isAllActivitiesFetched,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      closestDueDate,
      isSelected: selectedCardIds.includes(id),
      isSelectionActive: selectedCardIds.length > 0,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateCard(id, data),
      onMove: (listId, index) => entryActions.moveCard(id, listId, index),
      onTransfer: (boardId, listId) => entryActions.transferCard(id, boardId, listId),
      onDuplicate: () => entryActions.duplicateCard(id),
      onArchive: () => entryActions.archiveCard(id),
      onDelete: () => entryActions.deleteCard(id),
      onSelectionToggle: (isRange) => entryActions.toggleCardSelection(id, isRange),
      onUserAdd: (userId) => entryActions.addUserToCard(userId, id),
      onUserRemove: (userId) => entryActions.removeUserFromCard(userId, id),
      onBoardFetch: entryActions.fetchBoard,
      onLabelAdd: (labelId) => entryActions.addLabelToCard(labelId, id),
      onLabelRemove: (labelId) => entryActions.removeLabelFromCard(labelId, id),
      onLabelCreate: (data) => entryActions.createLabelInCurrentBoard(data),
      onLabelUpdate: (labelId, data) => entryActions.updateLabel(labelId, data),
      onLabelDelete: (labelId) => entryActions.deleteLabel(labelId),
      onTaskUpdate: (taskId, data) => entryActions.updateTask(taskId, data),
      onTaskDuplicate: (taskId) => entryActions.duplicateTask(taskId),
      onTaskDelete: (taskId) => entryActions.deleteTask(taskId),
      onUserToTaskAdd: (userId, taskId, cardId) => entryActions.addUserToTask(userId, taskId, cardId),
      onUserFromTaskRemove: (userId, taskId) => entryActions.removeUserFromTask(userId, taskId),
      onTaskCreate: (data) => entryActions.createTask(id, data),
      onTaskMove: (taskId, index) => entryActions.moveTask(taskId, index),
      onActivitiesFetch: () => entryActions.fetchActivitiesInCard(id),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(Card);
