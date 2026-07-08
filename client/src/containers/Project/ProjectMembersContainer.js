import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ProjectMembers from '../../components/Project/ProjectMembers';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { isFetching, items } = selectors.selectProjectMembersOverview(state);
  const allUsers = selectors.selectUsers(state);
  const { isAdmin } = selectors.selectCurrentUser(state);

  return {
    projectId,
    isFetching,
    items,
    allUsers,
    isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onFetch: entryActions.fetchProjectMembersOverview,
      onAddMember: (projectId, userId) => entryActions.createMembershipInProject(projectId, { userId }),
      onRemoveMember: entryActions.deleteProjectMembership,
      onUpdateMember: entryActions.updateProjectMembership,
      onAddManager: (projectId, userId) => entryActions.createManagerInProject(projectId, { userId }),
      onRemoveManager: entryActions.deleteProjectManager,
      onAddBoardMembership: (boardId, userId) => entryActions.createMembershipInBoard(boardId, { userId, role: 'editor' }),
      onUpdateBoardMembership: entryActions.updateBoardMembership,
      onRemoveBoardMembership: entryActions.deleteBoardMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectMembers);
