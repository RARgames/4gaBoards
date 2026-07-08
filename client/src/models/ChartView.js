import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ChartView';

  static Types = {
    GANTT: 'gantt',
    TEAM_PLANNER: 'teamPlanner',
  };

  static fields = {
    id: attr(),
    type: attr(),
    name: attr(),
    config: attr(),
    position: attr(),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'chartViews',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdChartViews',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedChartViews',
    }),
  };

  static reducer({ type, payload }, ChartView) {
    switch (type) {
      case ActionTypes.CHART_VIEWS_FETCH__SUCCESS:
        payload.chartViews.forEach((chartView) => {
          ChartView.upsert(chartView);
        });

        break;
      case ActionTypes.CHART_VIEW_CREATE:
        ChartView.upsert(payload.chartView);

        break;
      case ActionTypes.CHART_VIEW_CREATE__SUCCESS:
        ChartView.withId(payload.localId).delete();
        ChartView.upsert(payload.chartView);

        break;
      case ActionTypes.CHART_VIEW_CREATE__FAILURE: {
        const chartViewModel = ChartView.withId(payload.localId);

        if (chartViewModel) {
          chartViewModel.delete();
        }

        break;
      }
      case ActionTypes.CHART_VIEW_CREATE_HANDLE:
        ChartView.upsert(payload.chartView);

        break;
      case ActionTypes.CHART_VIEW_UPDATE:
        ChartView.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.CHART_VIEW_UPDATE__SUCCESS:
      case ActionTypes.CHART_VIEW_UPDATE_HANDLE: {
        const chartViewModel = ChartView.withId(payload.chartView.id);

        if (chartViewModel) {
          chartViewModel.update(payload.chartView);
        } else {
          ChartView.upsert(payload.chartView);
        }

        break;
      }
      case ActionTypes.CHART_VIEW_DELETE:
        ChartView.withId(payload.id).delete();

        break;
      case ActionTypes.CHART_VIEW_DELETE__SUCCESS:
      case ActionTypes.CHART_VIEW_DELETE_HANDLE: {
        const chartViewModel = ChartView.withId(payload.chartView.id);

        if (chartViewModel) {
          chartViewModel.delete();
        }

        break;
      }
      default:
    }
  }
}
