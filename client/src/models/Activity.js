import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Activity';

  static fields = {
    id: attr(),
    type: attr(),
    scope: attr(),
    data: attr(),
    isInCard: attr({
      getDefault: () => true,
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'activities',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'activities',
    }),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'activities',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'activities',
    }),
    createdAt: attr({
      getDefault: () => new Date(),
    }),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdActivities',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedActivities',
    }),
  };

  static reducer({ type, payload }, Activity) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Activity.all().delete();

        payload.activities.forEach((activity) => {
          Activity.upsert({
            ...activity,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.activities.forEach((activity) => {
          Activity.upsert({
            ...activity,
            isInCard: false,
          });
        });

        break;
      case ActionTypes.ACTIVITIES_CARD_FETCH__SUCCESS:
      case ActionTypes.COMMENT_ACTIVITIES_CARD_FETCH__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.activities.forEach((activity) => {
          Activity.upsert(activity);
        });

        break;
      case ActionTypes.ACTIVITY_CREATE_HANDLE:
      case ActionTypes.ACTIVITY_UPDATE_HANDLE:
      case ActionTypes.COMMENT_ACTIVITY_CREATE:
      case ActionTypes.COMMENT_ACTIVITY_UPDATE__SUCCESS:
        Activity.upsert(payload.activity);

        break;
      case ActionTypes.ACTIVITY_DELETE_HANDLE:
      case ActionTypes.COMMENT_ACTIVITY_DELETE__SUCCESS: {
        const activityModel = Activity.withId(payload.activity.id);

        if (activityModel) {
          activityModel.delete();
        }

        break;
      }
      case ActionTypes.COMMENT_ACTIVITY_CREATE__SUCCESS:
        Activity.withId(payload.localId).delete();
        Activity.upsert(payload.activity);

        break;
      case ActionTypes.COMMENT_ACTIVITY_UPDATE:
        Activity.withId(payload.id).update({
          data: payload.data,
        });

        break;
      case ActionTypes.COMMENT_ACTIVITY_DELETE:
        Activity.withId(payload.id).delete();

        break;
      default:
    }
  }
}
