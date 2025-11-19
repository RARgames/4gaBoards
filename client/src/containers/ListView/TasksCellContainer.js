import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TasksCell from '../../components/Board/ListView/TasksCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = () => {
  const selectClosestDueDateByCardId = selectors.makeSelectClosestTaskDueDateByCardId();

  return (state, { id }) => {
    const allBoardMemberships = selectors.selectBoardAndTaskMembershipsByCardId(state, id);
    const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);
    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const closestDueDate = selectClosestDueDateByCardId(state, id);
    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
    const { name: cardName, isActivitiesFetching, isAllActivitiesFetched } = selectors.selectCardById(state, id);

    return {
      cardName,
      allBoardMemberships,
      boardMemberships,
      isActivitiesFetching,
      isAllActivitiesFetched,
      closestDueDate,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
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

export default connect(mapStateToProps, mapDispatchToProps)(TasksCell);
