import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sidebar from '../components/Static/Sidebar';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
  const { sidebarCompact, rightClickContextMenu } = selectors.selectCurrentUserPrefs(state);
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const filteredProjects = selectors.selectFilteredProjectsWithDetailsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const boardTemplates = selectors.selectBoardTemplatesForCurrentUser(state);
  const { projectId, boardId } = selectors.selectPath(state);
  const filter = selectors.selectFilterForCurrentUser(state);
  const filterQuery = filter?.query;
  const filterTarget = filter?.target;
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;
  const instanceNotificationCount = selectors.selectInstanceNotificationsTotal(state);
  const usersNotificationCount = selectors.selectUsersNotificationsTotal(state);
  const { mailServiceAvailable, mailServiceInboundEmail } = selectors.selectCoreSettings(state);

  return {
    path,
    projects,
    filteredProjects,
    managedProjects,
    currProjectId: projectId,
    currBoardId: boardId,
    isAdmin,
    canAddProject: projectCreationAllEnabled || isAdmin,
    defaultData,
    isSubmitting,
    filterQuery,
    filterTarget,
    sidebarCompact,
    instanceNotificationCount,
    usersNotificationCount,
    boardTemplates,
    mailServiceAvailable,
    mailServiceInboundEmail,
    rightClickContextMenu,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectCreate: entryActions.createProject,
      onProjectUpdate: entryActions.updateProject,
      onProjectMove: entryActions.moveProject,
      onBoardCreate: entryActions.createBoard,
      onBoardUpdate: entryActions.updateBoard,
      onBoardMove: entryActions.moveBoard,
      onBoardDelete: entryActions.deleteBoard,
      onBoardExport: entryActions.exportBoard,
      onBoardFetch: entryActions.fetchBoard,
      onBoardTemplateCreate: entryActions.createBoardTemplate,
      onBoardTemplateUpdate: entryActions.updateBoardTemplate,
      onBoardTemplateDelete: entryActions.deleteBoardTemplate,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onProjectMembershipUpdate: entryActions.updateProjectMembership,
      onActivitiesProjectFetch: entryActions.fetchProjectActivities,
      onActivitiesBoardFetch: entryActions.fetchBoardActivities,
      onMailTokenCreate: (boardId) => entryActions.createMailToken({ boardId }),
      onMailTokenUpdate: (mailTokenId, boardId) => entryActions.updateMailToken(mailTokenId, { boardId }),
      onMailTokenDelete: (mailTokenId) => entryActions.deleteMailToken(mailTokenId),
      onBoardMembershipUpdate: entryActions.updateBoardMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
