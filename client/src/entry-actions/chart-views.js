import EntryActionTypes from '../constants/EntryActionTypes';

const fetchChartViews = (projectId) => ({
  type: EntryActionTypes.CHART_VIEWS_FETCH,
  payload: {
    projectId,
  },
});

const createChartViewInProject = (projectId, data) => ({
  type: EntryActionTypes.CHART_VIEW_IN_PROJECT_CREATE,
  payload: {
    projectId,
    data,
  },
});

const handleChartViewCreate = (chartView) => ({
  type: EntryActionTypes.CHART_VIEW_CREATE_HANDLE,
  payload: {
    chartView,
  },
});

const updateChartView = (id, data) => ({
  type: EntryActionTypes.CHART_VIEW_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleChartViewUpdate = (chartView) => ({
  type: EntryActionTypes.CHART_VIEW_UPDATE_HANDLE,
  payload: {
    chartView,
  },
});

const deleteChartView = (id) => ({
  type: EntryActionTypes.CHART_VIEW_DELETE,
  payload: {
    id,
  },
});

const handleChartViewDelete = (chartView) => ({
  type: EntryActionTypes.CHART_VIEW_DELETE_HANDLE,
  payload: {
    chartView,
  },
});

export default {
  fetchChartViews,
  createChartViewInProject,
  handleChartViewCreate,
  updateChartView,
  handleChartViewUpdate,
  deleteChartView,
  handleChartViewDelete,
};
