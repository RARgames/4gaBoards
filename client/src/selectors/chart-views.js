import { createSelector } from 'redux-orm';

import orm from '../orm';

export const makeSelectChartViewById = () =>
  createSelector(
    orm,
    (_, id) => id,
    ({ ChartView }, id) => {
      const chartViewModel = ChartView.withId(id);

      if (!chartViewModel) {
        return chartViewModel;
      }

      return chartViewModel.ref;
    },
  );

export const selectChartViewById = makeSelectChartViewById();

export const makeSelectChartViewsForProject = () =>
  createSelector(
    orm,
    (_, projectId) => projectId,
    (_, __, type) => type,
    ({ ChartView }, projectId, type) =>
      ChartView.filter((chartView) => chartView.projectId === projectId && (!type || chartView.type === type))
        .toRefArray()
        .sort((a, b) => a.position - b.position),
  );

export const selectChartViewsForProject = makeSelectChartViewsForProject();

export default {
  makeSelectChartViewById,
  selectChartViewById,
  makeSelectChartViewsForProject,
  selectChartViewsForProject,
};
