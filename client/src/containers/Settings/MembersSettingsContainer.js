import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MembersSettings from '../../components/Settings/MembersSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { isFetching, items } = selectors.selectMembersOverview(state);

  return {
    isFetching,
    items,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onFetch: entryActions.fetchMembersOverview,
      onAddMembership: (projectId, userId) => entryActions.createMembershipInProject(projectId, { userId }),
      onAddManager: (projectId, userId) => entryActions.createManagerInProject(projectId, { userId }),
      onRemoveMembership: entryActions.deleteProjectMembership,
      onRemoveManager: entryActions.deleteProjectManager,
      onUpdateMembership: entryActions.updateProjectMembership,
      onAddBoardMembership: (boardId, userId) => entryActions.createMembershipInBoard(boardId, { userId, role: 'editor' }),
      onUpdateBoardMembership: entryActions.updateBoardMembership,
      onRemoveBoardMembership: entryActions.deleteBoardMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(MembersSettings);
