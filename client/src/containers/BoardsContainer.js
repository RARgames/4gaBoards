import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Boards from '../components/Boards';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);
  const isFiltered = selectors.selectIsFilteredForCurrentUser(state);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const filter = selectors.selectFilterForCurrentUser(state);

  return {
    projectId,
    projects,
    filteredProjects,
    managedProjects,
    isFiltered,
    isAdmin,
    filterQuery: filter && filter.target === 'board' ? filter.query : '',
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createBoard,
      onChangeFilterQuery: entryActions.updateCurrentUserFilterQuery,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Boards);
