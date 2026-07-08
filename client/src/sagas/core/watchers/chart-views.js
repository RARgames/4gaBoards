import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* chartViewsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.CHART_VIEWS_FETCH, ({ payload: { projectId } }) => services.fetchChartViews(projectId)),
    takeEvery(EntryActionTypes.CHART_VIEW_IN_PROJECT_CREATE, ({ payload: { projectId, data } }) => services.createChartViewInProject(projectId, data)),
    takeEvery(EntryActionTypes.CHART_VIEW_CREATE_HANDLE, ({ payload: { chartView } }) => services.handleChartViewCreate(chartView)),
    takeEvery(EntryActionTypes.CHART_VIEW_UPDATE, ({ payload: { id, data } }) => services.updateChartView(id, data)),
    takeEvery(EntryActionTypes.CHART_VIEW_UPDATE_HANDLE, ({ payload: { chartView } }) => services.handleChartViewUpdate(chartView)),
    takeEvery(EntryActionTypes.CHART_VIEW_DELETE, ({ payload: { id } }) => services.deleteChartView(id)),
    takeEvery(EntryActionTypes.CHART_VIEW_DELETE_HANDLE, ({ payload: { chartView } }) => services.handleChartViewDelete(chartView)),
  ]);
}
