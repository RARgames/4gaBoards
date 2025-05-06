import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TimerCell from '../../components/Board/ListView/TimerCell';
import { BoardMembershipRoles } from '../../constants/Enums';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
  const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

  return {
    canEdit: isCurrentUserEditor,
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onUpdate: (data) => entryActions.updateCard(id, data),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimerCell);
