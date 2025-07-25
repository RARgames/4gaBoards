import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MembersCell from '../../components/Board/ListView/MembersCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state, { id }) => {
  const allBoardMemberships = selectors.selectBoardAndCardMembershipsByCardId(state, id);
  const boardMemberships = selectors.selectMembershipsForCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    boardMemberships,
    allBoardMemberships,
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUserAdd: (userId) => entryActions.addUserToCard(userId, id),
      onUserRemove: (userId) => entryActions.removeUserFromCard(userId, id),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(MembersCell);
