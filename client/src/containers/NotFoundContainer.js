import { connect } from 'react-redux';

import NotFound from '../components/NotFound';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const isCoreInitializing = selectors.selectIsCoreInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);

  return {
    isSocketDisconnected,
    isInitializing: isCoreInitializing,
  };
};

export default connect(mapStateToProps)(NotFound);
