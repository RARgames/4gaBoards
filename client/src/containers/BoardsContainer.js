import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import Boards from '../components/Boards';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const { projects, filteredProjects } = selectors.selectProjectsForCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);

  return {
    projectId,
    projects,
    filteredProjects,
    managedProjects,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCreate: entryActions.createBoard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Boards);
