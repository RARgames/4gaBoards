import { connect } from 'react-redux';

import ProjectNav from '../../components/Project/ProjectNav';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const { projectId } = selectors.selectPath(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const { isAdmin } = selectors.selectCurrentUser(state);

  return {
    projectId,
    path,
    isManager,
    isAdmin,
  };
};

export default connect(mapStateToProps)(ProjectNav);
