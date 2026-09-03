import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ArchiveView from '../components/Board/ArchiveView';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const allLabels = selectors.selectLabelsForCurrentBoard(state);
  const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);

  return {
    boardId,
    allLabels,
    canEdit: !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onRestore: (id) => entryActions.unarchiveCard(id),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ArchiveView);
