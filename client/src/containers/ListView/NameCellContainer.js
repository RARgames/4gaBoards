import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NameCell from '../../components/Board/ListView/NameCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state, { id }) => {
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;
  const users = selectors.selectUsersByCardId(state, id);
  const labels = selectors.selectLabelsByCardId(state, id);

  return {
    canEdit: isCurrentUserEditor,
    boardMemberships: selectors.selectMembershipsForCurrentBoard(state),
    boardLabels: selectors.selectLabelsForCurrentBoard(state),
    currentUserIds: users.map((user) => user.id),
    currentLabelIds: labels.map((label) => label.id),
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateCard(id, data),
      onUserAdd: (userId) => entryActions.addUserToCard(userId, id),
      onLabelAdd: (labelId) => entryActions.addLabelToCard(labelId, id),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(NameCell);
