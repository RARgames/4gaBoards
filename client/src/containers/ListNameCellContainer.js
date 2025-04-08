import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ListNameCell from '../components/Board/ListView/ListNameCell';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state, { id }) => {
  const { projectId, boardId } = selectors.selectPath(state);
  const { listId } = selectors.selectCardById(state, id);
  const allProjectsToLists = selectors.selectProjectsToListsForCurrentUser(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    projectId,
    boardId,
    listId,
    allProjectsToLists,
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onMove: (listId) => entryActions.moveCard(id, listId),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ListNameCell);
