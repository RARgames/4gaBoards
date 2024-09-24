import { connect } from 'react-redux';

import selectors from '../selectors';
import Core from '../components/Core';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const isCoreInitializing = selectors.selectIsCoreInitializing(state);
  const isSocketDisconnected = selectors.selectIsSocketDisconnected(state);
  const currentModal = selectors.selectCurrentModal(state);
  const currentProject = selectors.selectCurrentProject(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentCard = selectors.selectCurrentCard(state);

  return {
    path,
    isSocketDisconnected,
    currentModal,
    currentProject,
    currentBoard,
    currentCard,
    isInitializing: isCoreInitializing,
  };
};

export default connect(mapStateToProps)(Core);
