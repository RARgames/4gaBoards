import { connect } from 'react-redux';

import Core from '../components/Core';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const isCoreInitializing = selectors.selectIsCoreInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);
  const currentModal = selectors.selectCurrentModal(state);
  const currentProject = selectors.selectCurrentProject(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentCard = selectors.selectCurrentCard(state);

  return {
    isSocketDisconnected,
    currentModal,
    currentProject,
    currentBoard,
    currentCard,
    isInitializing: isCoreInitializing,
  };
};

export default connect(mapStateToProps)(Core);
