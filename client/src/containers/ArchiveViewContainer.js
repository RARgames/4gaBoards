import { connect } from 'react-redux';

import ArchiveView from '../components/Board/ArchiveView';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const { boardId } = selectors.selectPath(state);
  const allLabels = selectors.selectLabelsForCurrentBoard(state);

  return {
    boardId,
    allLabels,
  };
};

export default connect(mapStateToProps)(ArchiveView);
