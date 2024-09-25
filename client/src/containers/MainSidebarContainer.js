import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import MainSidebar from '../components/Static/MainSidebar';

const mapStateToProps = (state) => {
  const { isAdmin, sidebarCompact } = selectors.selectCurrentUser(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
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
    projects,
    filteredProjects,
    managedProjects,
    currProjectId: projectId,
    currBoardId: boardId,
    isAdmin,
    defaultData,
    isSubmitting,
    filterQuery,
    filterTarget,
    sidebarCompact,
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
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onUserProjectUpdate: entryActions.updateUserProject,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(MainSidebar);
