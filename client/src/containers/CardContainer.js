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

  return (state, { id, index }) => {
    const currentCardId = selectors.selectPath(state).cardId;
    const isOpen = currentCardId === id;

    const { projectId } = selectors.selectPath(state);
    const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
    const allBoardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const allLabels = selectors.selectLabelsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const { name, dueDate, timer, coverUrl, description, boardId, listId, isPersisted, commentCount, createdAt, createdBy, updatedAt, updatedBy } = selectCardById(state, id);

    const users = selectUsersByCardId(state, id);
    const labels = selectLabelsByCardId(state, id);
    const tasks = selectTasksByCardId(state, id).map((task) => ({
      ...task,
      users: selectors.selectUsersForTaskById(state, task.id),
    }));
    const notificationsTotal = selectNotificationsTotalByCardId(state, id);
    const attachmentsCount = selectAttachmentsCountByCardId(state, id);

    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const url = selectors.selectUrlForCard(state, id);

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
      allBoardMemberships,
      allLabels,
      canEdit: isCurrentUserEditor,
      url,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
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
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(Card);
