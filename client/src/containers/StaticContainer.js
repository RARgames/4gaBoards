import { connect } from 'react-redux';

import selectors from '../selectors';
import Static from '../components/Static';

const mapStateToProps = (state) => {
  const { cardId, projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const path = selectors.selectPathname(state);

  return {
    projectId,
    cardId,
    board: currentBoard,
    path,
  };
};

export default connect(mapStateToProps)(Static);
