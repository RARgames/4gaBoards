import { connect } from 'react-redux';

import Static from '../components/Static';
import selectors from '../selectors';

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
