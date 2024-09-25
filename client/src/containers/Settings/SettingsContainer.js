import { connect } from 'react-redux';

import selectors from '../../selectors';
import Settings from '../../components/Settings';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const currentUser = selectors.selectCurrentUser(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

  return {
    path,
    isAdmin: currentUser.isAdmin,
    isManager,
  };
};

export default connect(mapStateToProps)(Settings);
