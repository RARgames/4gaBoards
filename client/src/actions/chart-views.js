import ActionTypes from '../constants/ActionTypes';

const fetchChartViews = (projectId) => ({
  type: ActionTypes.CHART_VIEWS_FETCH,
  payload: {
    projectId,
  },
});

fetchChartViews.success = (projectId, chartViews) => ({
  type: ActionTypes.CHART_VIEWS_FETCH__SUCCESS,
  payload: {
    projectId,
    chartViews,
  },
});

fetchChartViews.failure = (projectId, error) => ({
  type: ActionTypes.CHART_VIEWS_FETCH__FAILURE,
  payload: {
    projectId,
    error,
  },
});

const createChartView = (chartView) => ({
  type: ActionTypes.CHART_VIEW_CREATE,
  payload: {
    chartView,
  },
});

createChartView.success = (localId, chartView) => ({
  type: ActionTypes.CHART_VIEW_CREATE__SUCCESS,
  payload: {
    localId,
    chartView,
  },
});

createChartView.failure = (localId, error) => ({
  type: ActionTypes.CHART_VIEW_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleChartViewCreate = (chartView) => ({
  type: ActionTypes.CHART_VIEW_CREATE_HANDLE,
  payload: {
    chartView,
  },
});

const updateChartView = (id, data) => ({
  type: ActionTypes.CHART_VIEW_UPDATE,
  payload: {
    id,
    data,
  },
});

updateChartView.success = (chartView) => ({
  type: ActionTypes.CHART_VIEW_UPDATE__SUCCESS,
  payload: {
    chartView,
  },
});

updateChartView.failure = (id, error) => ({
  type: ActionTypes.CHART_VIEW_UPDATE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleChartViewUpdate = (chartView) => ({
  type: ActionTypes.CHART_VIEW_UPDATE_HANDLE,
  payload: {
    chartView,
  },
});

const deleteChartView = (id) => ({
  type: ActionTypes.CHART_VIEW_DELETE,
  payload: {
    id,
  },
});

deleteChartView.success = (chartView) => ({
  type: ActionTypes.CHART_VIEW_DELETE__SUCCESS,
  payload: {
    chartView,
  },
});

deleteChartView.failure = (id, error) => ({
  type: ActionTypes.CHART_VIEW_DELETE__FAILURE,
  payload: {
    id,
    error,
  },
});

const handleChartViewDelete = (chartView) => ({
  type: ActionTypes.CHART_VIEW_DELETE_HANDLE,
  payload: {
    chartView,
  },
});

export default {
  fetchChartViews,
  createChartView,
  handleChartViewCreate,
  updateChartView,
  handleChartViewUpdate,
  deleteChartView,
  handleChartViewDelete,
};
