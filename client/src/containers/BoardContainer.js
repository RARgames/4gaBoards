import { connect } from 'react-redux';

import Board from '../components/Board';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { cardId, boardId } = selectors.selectPath(state);
  const { defaultView } = selectors.selectCurrentUserPrefs(state);

  return {
    id: boardId,
    isCardModalOpened: !!cardId,
    defaultView,
  };
};

export default connect(mapStateToProps)(Board);
