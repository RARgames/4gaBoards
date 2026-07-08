import { call, put } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* fetchChartViews(projectId) {
  yield put(actions.fetchChartViews(projectId));

  let chartViews;
  try {
    ({ items: chartViews } = yield call(request, api.getChartViews, projectId));
  } catch (error) {
    yield put(actions.fetchChartViews.failure(projectId, error));
    return;
  }

  yield put(actions.fetchChartViews.success(projectId, chartViews));
}

export function* createChartViewInProject(projectId, data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createChartView({
      ...data,
      projectId,
      id: localId,
    }),
  );

  let chartView;
  try {
    ({ item: chartView } = yield call(request, api.createChartView, projectId, data));
  } catch (error) {
    yield put(actions.createChartView.failure(localId, error));
    return;
  }

  yield put(actions.createChartView.success(localId, chartView));
}

export function* handleChartViewCreate(chartView) {
  yield put(actions.handleChartViewCreate(chartView));
}

export function* updateChartView(id, data) {
  yield put(actions.updateChartView(id, data));

  let chartView;
  try {
    ({ item: chartView } = yield call(request, api.updateChartView, id, data));
  } catch (error) {
    yield put(actions.updateChartView.failure(id, error));
    return;
  }

  yield put(actions.updateChartView.success(chartView));
}

export function* handleChartViewUpdate(chartView) {
  yield put(actions.handleChartViewUpdate(chartView));
}

export function* deleteChartView(id) {
  yield put(actions.deleteChartView(id));

  let chartView;
  try {
    ({ item: chartView } = yield call(request, api.deleteChartView, id));
  } catch (error) {
    yield put(actions.deleteChartView.failure(id, error));
    return;
  }

  yield put(actions.deleteChartView.success(chartView));
}

export function* handleChartViewDelete(chartView) {
  yield put(actions.handleChartViewDelete(chartView));
}

export default {
  fetchChartViews,
  createChartViewInProject,
  handleChartViewCreate,
  updateChartView,
  handleChartViewUpdate,
  deleteChartView,
  handleChartViewDelete,
};
