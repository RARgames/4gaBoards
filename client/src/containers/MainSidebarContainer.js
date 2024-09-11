import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import MainSidebar from '../components/Static/MainSidebar';

const mapStateToProps = (state) => {
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const currProject = selectors.selectCurrentProject(state);
  const currBoard = selectors.selectCurrentBoard(state);
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  return {
    projects,
    filteredProjects,
    currProjectId: currProject?.id,
    currBoardId: currBoard?.id,
    canAdd: isAdmin,
    defaultData,
    isSubmitting,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onProjectCreate: entryActions.createProject,
      onBoardCreate: entryActions.createBoard,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onBoardUpdate: entryActions.updateBoard,
      onUserProjectUpdate: entryActions.updateUserProject,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(MainSidebar);
