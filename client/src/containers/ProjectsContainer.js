import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Projects from '../components/Projects';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { projectCreationAll } = selectors.selectCoreSettings(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  return {
    projects,
    filteredProjects,
    isFiltered,
    canAdd: projectCreationAll || isAdmin,
    defaultData,
    isSubmitting,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createProject,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
