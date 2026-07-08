import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TeamPlanner from '../../components/Project/TeamPlanner';
import ChartView from '../../models/ChartView';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { projectId } = selectors.selectPath(state);
  const schedulingData = selectors.selectSchedulingData(state, projectId);
  const chartViews = selectors.selectChartViewsForProject(state, projectId, ChartView.Types.TEAM_PLANNER);
  const { isAdmin } = selectors.selectCurrentUser(state);
  const isManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);

  return {
    projectId,
    schedulingData,
    chartViews,
    canManageViews: isAdmin || isManager,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onBoardFetch: entryActions.fetchBoard,
      onCardUpdate: entryActions.updateCard,
      onUserAddToCard: entryActions.addUserToCard,
      onUserRemoveFromCard: entryActions.removeUserFromCard,
      onChartViewsFetch: entryActions.fetchChartViews,
      onChartViewCreate: entryActions.createChartViewInProject,
      onChartViewUpdate: entryActions.updateChartView,
      onChartViewDelete: entryActions.deleteChartView,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TeamPlanner);
