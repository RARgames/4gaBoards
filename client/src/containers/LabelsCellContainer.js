import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LabelsCell from '../components/Board/ListView/LabelsCell';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  return (state) => {
    const allLabels = selectors.selectLabelsForCurrentBoard(state);

    const currentUserMembership = selectors.selectCurrentUserMembershipForCurrentBoard(state);
    const isCurrentUserEditor = !!currentUserMembership && currentUserMembership.role === BoardMembershipRoles.EDITOR;

    return {
      allLabels,
      canEdit: isCurrentUserEditor,
    };
  };
};

const mapDispatchToProps = (dispatch, { id }) =>
  bindActionCreators(
    {
      onLabelAdd: (labelId) => entryActions.addLabelToCard(labelId, id),
      onLabelRemove: (labelId) => entryActions.removeLabelFromCard(labelId, id),
      onLabelCreate: entryActions.createLabelInCurrentBoard,
      onLabelUpdate: entryActions.updateLabel,
      onLabelDelete: entryActions.deleteLabel,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(LabelsCell);
