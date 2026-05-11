import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Project from '../components/Project';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { isSubscribed } = selectors.selectProject(state, projectId);

  return {
    projectId,
    projects,
    filteredProjects,
    managedProjects,
    isFiltered,
    isAdmin,
    isSubscribed,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardCreate: entryActions.createBoard,
      onProjectMembershipUpdate: entryActions.updateProjectMembership,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Project);
