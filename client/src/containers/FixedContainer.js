import { connect } from 'react-redux';

import selectors from '../selectors';
import Fixed from '../components/Fixed';

const mapStateToProps = (state) => {
  const currentBoard = selectors.selectCurrentBoard(state);

  return {
    board: currentBoard,
  };
};

export default connect(mapStateToProps)(Fixed);
