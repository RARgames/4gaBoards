import { connect } from 'react-redux';

import selectors from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const { cardId, projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  return {
    path,
    projectId,
    cardId,
    board: currentBoard,
  };
};

export default connect(mapStateToProps)(Static);
