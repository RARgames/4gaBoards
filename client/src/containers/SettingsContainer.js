import { connect } from 'react-redux';

import selectors from '../selectors';
import Settings from '../components/Settings';

const mapStateToProps = (state) => {
  const path = selectors.selectPathname(state);
  const currentUser = selectors.selectCurrentUser(state);

  return {
    path,
    isAdmin: currentUser.isAdmin,
  };
};

export default connect(mapStateToProps)(Settings);
