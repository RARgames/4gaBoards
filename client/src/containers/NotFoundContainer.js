import { connect } from 'react-redux';

import selectors from '../selectors';
import NotFound from '../components/NotFound';

const mapStateToProps = (state) => {
  const isCoreInitializing = selectors.selectIsCoreInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);
  const currentModal = selectors.selectCurrentModal(state);

  return {
    isSocketDisconnected,
    currentModal,
    isInitializing: isCoreInitializing,
  };
};

export default connect(mapStateToProps)(NotFound);
