import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Projects from '../components/Projects';

const mapStateToProps = (state) => {
  const { isAdmin } = selectors.selectCurrentUser(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const {
    ui: {
      projectCreateForm: { data: defaultData, isSubmitting },
    },
  } = state;

  return {
    projects,
    filteredProjects,
    isAdmin,
    isFiltered,
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
