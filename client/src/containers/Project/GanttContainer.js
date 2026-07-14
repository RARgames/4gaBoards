import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Gantt from '../../components/Project/Gantt';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const schedulingData = selectors.selectSchedulingData(state, projectId);

  return {
    schedulingData,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardFetch: entryActions.fetchBoard,
      onCardUpdate: entryActions.updateCard,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Gantt);
