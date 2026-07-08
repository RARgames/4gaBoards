import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Gantt from '../../components/Project/Gantt';
import ChartView from '../../models/ChartView';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const schedulingData = selectors.selectSchedulingData(state, projectId);
  const chartViews = selectors.selectChartViewsForProject(state, projectId, ChartView.Types.GANTT);
  const { id: currentUserId, isAdmin } = selectors.selectCurrentUser(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

  return {
    projectId,
    schedulingData,
    chartViews,
    currentUserId,
    canManageViews: isAdmin || isManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardFetch: entryActions.fetchBoard,
      onCardUpdate: entryActions.updateCard,
      onChartViewsFetch: entryActions.fetchChartViews,
      onChartViewCreate: entryActions.createChartViewInProject,
      onChartViewUpdate: entryActions.updateChartView,
      onChartViewDelete: entryActions.deleteChartView,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Gantt);
