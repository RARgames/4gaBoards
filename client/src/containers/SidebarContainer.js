import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sidebar from '../components/Static/Sidebar';
import { BoardMembershipRoles } from '../constants/Enums';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectProjectActivitiesById = selectors.makeSelectProjectActivitiesById();
  const selectBoardActivitiesById = selectors.makeSelectBoardActivitiesById();
  const selectCurrentUserMembershipByBoardId = selectors.makeSelectCurrentUserMembershipByBoardId();
  const selectMailTokensByBoardId = selectors.makeSelectMailTokensByBoardId();
  const selectMailTokenCountByBoardId = selectors.makeSelectMailTokenCountByBoardId();

  return (state) => {
    const path = selectors.selectPathConstant(state);
    const { isAdmin } = selectors.selectCurrentUser(state);
    const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
    const { sidebarCompact } = selectors.selectCurrentUserPrefs(state);
    const { projects, filteredProjects: _filteredProjects } = selectors.selectProjectsForCurrentUser(state);
    const filteredProjects = _filteredProjects.map((project) => ({
      ...project,
      activities: selectProjectActivitiesById(state, project.id),
      boards: project.boards.map((board) => {
        const membership = selectCurrentUserMembershipByBoardId(state, board.id);
        const isCurrentUserEditor = !!membership && membership.role === BoardMembershipRoles.EDITOR;

        return {
          ...board,
          activities: selectBoardActivitiesById(state, board.id),
          mailTokens: selectMailTokensByBoardId(state, board.id),
          mailTokenCount: selectMailTokenCountByBoardId(state, board.id),
          canEdit: isCurrentUserEditor,
        };
      }),
    }));
    const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
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
      mailServiceAvailable,
      mailServiceInboundEmail,
    };
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectCreate: entryActions.createProject,
      onProjectUpdate: entryActions.updateProject,
      onBoardCreate: entryActions.createBoard,
      onBoardUpdate: entryActions.updateBoard,
      onBoardMove: entryActions.moveBoard,
      onBoardDelete: entryActions.deleteBoard,
      onBoardExport: entryActions.exportBoard,
      onBoardFetch: entryActions.fetchBoard,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onProjectMembershipUpdate: entryActions.updateProjectMembership,
      onActivitiesProjectFetch: entryActions.fetchProjectActivities,
      onActivitiesBoardFetch: entryActions.fetchBoardActivities,
      onMailTokenCreate: (boardId) => entryActions.createMailToken({ boardId }),
      onMailTokenUpdate: (mailTokenId, boardId) => entryActions.updateMailToken(mailTokenId, { boardId }),
      onMailTokenDelete: (mailTokenId) => entryActions.deleteMailToken(mailTokenId),
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(Sidebar);
