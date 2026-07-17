import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Projects from '../components/Projects';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { projectCreationAllEnabled } = selectors.selectCoreSettings(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const filter = selectors.selectFilterForCurrentUser(state);
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  return {
    projects,
    filteredProjects,
    managedProjects,
    isFiltered,
    isAdmin,
    canAdd: projectCreationAllEnabled || isAdmin,
    defaultData,
    isSubmitting,
    filterQuery: filter && filter.target === 'project' ? filter.query : '',
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createProject,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
      onProjectUpdate: entryActions.updateProject,
      onBackgroundImageUpdate: entryActions.updateProjectBackgroundImage,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
