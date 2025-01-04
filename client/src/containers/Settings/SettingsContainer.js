import { connect } from 'react-redux';

import Settings from '../../components/Settings';
import selectors from '../../selectors';

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
