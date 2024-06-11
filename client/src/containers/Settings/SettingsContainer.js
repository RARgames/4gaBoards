import { connect } from 'react-redux';

import selectors from '../../selectors';
import Settings from '../../components/Settings';

const mapStateToProps = (state) => {
  const realPath = selectors.selectPathname(state);
  const currentUser = selectors.selectCurrentUser(state);
  const managedProjects = selectors.selectManagedProjectsForCurrentUser(state);

  return {
    realPath,
    isAdmin: currentUser.isAdmin,
    managedProjects,
  };
};

export default connect(mapStateToProps)(Settings);
