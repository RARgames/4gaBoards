import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Card from '../components/Card';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectCardById = selectors.makeSelectCardById();
  const selectUsersByCardId = selectors.makeSelectUsersByCardId();
  const selectLabelsByCardId = selectors.makeSelectLabelsByCardId();
  const selectTasksByCardId = selectors.makeSelectTasksByCardId();
  const selectNotificationsTotalByCardId = selectors.makeSelectNotificationsTotalByCardId();
  const selectAttachmentsCountByCardId = selectors.makeSelectAttachmentsCountByCardId();
  const selectClosestDueDateByCardId = selectors.makeSelectClosestTaskDueDateByCardId();

  return (state, { id, index }) => {
    const currentCardId = selectors.selectPath(state).cardId;
    const isOpen = currentCardId === id;

    const { projectId } = selectors.selectPath(state);
    const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
    const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const boardAndCardMemberships = selectors.selectBoardAndCardMembershipsByCardId(state, id);
    const boardAndTaskMemberships = selectors.selectBoardAndTaskMembershipsByCardId(state, id);
    const allLabels = selectors.selectLabelsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const { name, dueDate, timer, coverUrl, description, boardId, listId, isPersisted, commentCount, isActivitiesFetching, isAllActivitiesFetched, createdAt, createdBy, updatedAt, updatedBy } = selectCardById(
      state,
      id,
    );

    const users = selectUsersByCardId(state, id);
    const labels = selectLabelsByCardId(state, id);
    const taskActivities = selectors.selectTaskActivitiesByCardId(state, id);
    const tasks = selectTasksByCardId(state, id).map((task) => ({
      ...task,
      users: selectors.selectUsersForTaskById(state, task.id),
      activities: taskActivities[task.id] || [],
    }));
    const notificationsTotal = selectNotificationsTotalByCardId(state, id);
    const attachmentsCount = selectAttachmentsCountByCardId(state, id);
    const closestDueDate = selectClosestDueDateByCardId(state, id);

    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const url = selectors.selectUrlForCard(state, id);
    const activities = selectors.selectActivitiesByCardId(state, id);

    return {
      id,
      index,
      name,
      dueDate,
      timer,
      coverUrl,
      boardId,
      listId,
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
      allProjectsToLists,
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
      onDelete: () => entryActions.deleteCard(id),
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
