import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Project from '../components/Project';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const filteredProjects = selectors.selectFilteredProjectsWithDetailsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const boardTemplates = selectors.selectBoardTemplatesForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { isSubscribed } = selectors.selectProject(state, projectId);
  const { rightClickContextMenu } = selectors.selectCurrentUserPrefs(state);
  const { mailServiceAvailable, mailServiceInboundEmail } = selectors.selectCoreSettings(state);

  return {
    projectId,
    projects,
    filteredProjects,
    managedProjects,
    boardTemplates,
    isFiltered,
    isAdmin,
    isSubscribed,
    mailServiceAvailable,
    mailServiceInboundEmail,
    rightClickContextMenu,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardCreate: entryActions.createBoard,
      onBoardUpdate: entryActions.updateBoard,
      onBoardDelete: entryActions.deleteBoard,
      onBoardExport: entryActions.exportBoard,
      onBoardFetch: entryActions.fetchBoard,
      onBoardMembershipUpdate: entryActions.updateBoardMembership,
      onActivitiesBoardFetch: entryActions.fetchBoardActivities,
      onMailTokenCreate: (boardId) => entryActions.createMailToken({ boardId }),
      onMailTokenUpdate: (mailTokenId, boardId) => entryActions.updateMailToken(mailTokenId, { boardId }),
      onMailTokenDelete: (mailTokenId) => entryActions.deleteMailToken(mailTokenId),
      onBoardTemplateCreate: entryActions.createBoardTemplate,
      onBoardTemplateUpdate: entryActions.updateBoardTemplate,
      onBoardTemplateDelete: entryActions.deleteBoardTemplate,
      onProjectMembershipUpdate: entryActions.updateProjectMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Project);
