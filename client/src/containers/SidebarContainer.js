import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Sidebar from '../components/Static/Sidebar';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const makeMapStateToProps = () => {
  const selectProjectActivitiesById = selectors.makeSelectProjectActivitiesById();
  const selectBoardActivitiesById = selectors.makeSelectBoardActivitiesById();

  return (state) => {
    const path = selectors.selectPathConstant(state);
    const { isAdmin } = selectors.selectCurrentUser(state);
    const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
    const { sidebarCompact } = selectors.selectCurrentUserPrefs(state);
    const { projects, filteredProjects: _filteredProjects } = selectors.selectProjectsForCurrentUser(state);
    const filteredProjects = _filteredProjects.map((project) => ({
      ...project,
      activities: selectProjectActivitiesById(state, project.id),
      boards: project.boards.map((board) => ({
        ...board,
        activities: selectBoardActivitiesById(state, board.id),
      })),
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
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onUserProjectUpdate: entryActions.updateUserProject,
      onActivitiesProjectFetch: entryActions.fetchProjectActivities,
      onActivitiesBoardFetch: entryActions.fetchBoardActivities,
    },
    dispatch,
  );

export default connect(makeMapStateToProps, mapDispatchToProps)(Sidebar);
