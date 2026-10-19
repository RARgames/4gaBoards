import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Board from '../components/Board';
import { push, replace } from '../lib/redux-router';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { cardId, boardId } = selectors.selectPath(state);
  const { defaultView } = selectors.selectCurrentUserPrefs(state);

  return {
    id: boardId,
    cardId,
    isCardModalOpened: !!cardId,
    pathname: selectors.selectPathname(state),
    pathView: selectors.selectPathView(state),
    defaultView,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onNavigatePush: push,
      onNavigateReplace: replace,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Board);
