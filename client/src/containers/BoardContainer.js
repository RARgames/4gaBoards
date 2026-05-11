import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Board from '../components/Board';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { cardId, boardId } = selectors.selectPath(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const listIds = selectors.selectListIdsForCurrentBoard(state);
  const { defaultView } = selectors.selectCurrentUserPrefs(state);

  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    id: boardId,
    listIds,
    isCardModalOpened: !!cardId,
    canEdit: isCurrentUserEditor,
    defaultView,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onListCreate: entryActions.createListInCurrentBoard,
      onListMove: entryActions.moveList,
      onCardMove: entryActions.moveCard,
      onTaskMove: entryActions.moveTask,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
