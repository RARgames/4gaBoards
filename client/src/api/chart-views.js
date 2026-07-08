import socket from './socket';
import { transformChartView } from './transformers';

/* Actions */

const getChartViews = (projectId, headers) =>
  socket.get(`/projects/${projectId}/chart-views`, undefined, headers).then((body) => ({
    ...body,
    items: body.items.map(transformChartView),
  }));

const createChartView = (projectId, data, headers) =>
  socket.post(`/projects/${projectId}/chart-views`, data, headers).then((body) => ({
    ...body,
    item: transformChartView(body.item),
  }));

const updateChartView = (id, data, headers) =>
  socket.patch(`/chart-views/${id}`, data, headers).then((body) => ({
    ...body,
    item: transformChartView(body.item),
  }));

const deleteChartView = (id, headers) =>
  socket.delete(`/chart-views/${id}`, undefined, headers).then((body) => ({
    ...body,
    item: transformChartView(body.item),
  }));

/* Event handlers */

const makeHandleChartViewCreate = (next) => (body) => {
  next({
    ...body,
    item: transformChartView(body.item),
  });
};

const makeHandleChartViewUpdate = makeHandleChartViewCreate;

const makeHandleChartViewDelete = makeHandleChartViewCreate;

export default {
  getChartViews,
  createChartView,
  updateChartView,
  deleteChartView,
  makeHandleChartViewCreate,
  makeHandleChartViewUpdate,
  makeHandleChartViewDelete,
};
