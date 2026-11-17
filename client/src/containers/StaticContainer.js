import { connect } from 'react-redux';

import Static from '../components/Static';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const { cardId, projectId } = selectors.selectPath(state);
  const currentBoard = selectors.selectCurrentBoard(state);
  const currentProject = selectors.selectCurrentProject(state);

  return {
    path,
    projectId,
    cardId,
    board: currentBoard,
    hasBackground: !!currentProject?.background,
  };
};

export default connect(mapStateToProps)(Static);
