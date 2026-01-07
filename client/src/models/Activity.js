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
    attachmentId: fk({
      to: 'Attachment',
      as: 'attachment',
      relatedName: 'activities',
    }),
    commentId: fk({
      to: 'Comment',
      as: 'comment',
      relatedName: 'activities',
    }),
    taskId: fk({
      to: 'Task',
      as: 'task',
      relatedName: 'activities',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'activities',
    }),
    listId: fk({
      to: 'List',
      as: 'list',
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
    userAccountId: fk({
      to: 'User',
      as: 'userAccount',
      relatedName: 'userAccountActivities',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'activities',
    }),
    instanceId: fk({
      to: 'Core',
      as: 'core',
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
      case ActionTypes.ACTIVITIES_ATTACHMENT_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_COMMENT_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_TASK_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_CARD_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_LIST_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_BOARD_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_PROJECT_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_USER_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_USER_ACCOUNT_FETCH__SUCCESS:
      case ActionTypes.ACTIVITIES_INSTANCE_FETCH__SUCCESS:
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        payload.activities.forEach((activity) => {
          Activity.upsert(activity);
        });

        break;
      case ActionTypes.ACTIVITY_CREATE_HANDLE:
        Activity.upsert(payload.activity);

        break;
      default:
    }
  }
}
