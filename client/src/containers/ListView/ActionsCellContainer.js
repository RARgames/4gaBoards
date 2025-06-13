import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ActionsCell from '../../components/Board/ListView/ActionsCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const makeMapStateToProps = () => {
  const selectCardById = selectors.makeSelectCardById();
  const selectUsersByCardId = selectors.makeSelectUsersByCardId();
  const selectLabelsByCardId = selectors.makeSelectLabelsByCardId();

  return (state, { id }) => {
    const { projectId } = selectors.selectPath(state);
    const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
    const allBoardMemberships = selectors.selectBoardAndCardMembershipsByCardId(state, id);
    const allLabels = selectors.selectLabelsForCurrentBoard(state);
    const url = selectors.selectUrlForCard(state, id);
    const { name, dueDate, timer, boardId, listId, createdAt, createdBy, updatedAt, updatedBy, isPersisted } = selectCardById(state, id);
    const users = selectUsersByCardId(state, id);
    const labels = selectLabelsByCardId(state, id);

    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      name,
      projectId,
      allProjectsToLists,
      allBoardMemberships,
      allLabels,
      url,
      dueDate,
      timer,
      boardId,
      listId,
      isPersisted,
      users,
      labels,
      canEdit: isCurrentUserEditor,
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
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(ActionsCell);
