import { attr, fk, many } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Task';

  static fields = {
    id: attr(),
    position: attr(),
    name: attr(),
    isCompleted: attr({
      getDefault: () => false,
    }),
    dueDate: attr(),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'tasks',
    }),
    users: many('User', 'tasks'),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => false,
    }),
    lastActivityId: attr(),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdTasks',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedTasks',
    }),
  };

  static reducer({ type, payload }, Task) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.tasks) {
          payload.tasks.forEach((task) => {
            Task.upsert(task);
          });
        }

        if (payload.taskMemberships) {
          const taskIds = new Set(payload.taskMemberships.map(({ taskId }) => taskId));
          taskIds.forEach((taskId) => {
            Task.withId(taskId).deleteUsers();
          });

          payload.taskMemberships.forEach(({ taskId, userId }) => {
            Task.withId(taskId).users.add(userId);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Task.all()
          .toModelArray()
          .forEach((taskModel) => {
            taskModel.deleteWithRelated();
          });

        if (payload.tasks) {
          payload.tasks.forEach((task) => {
            Task.upsert(task);
          });
        }

        if (payload.taskMemberships) {
          payload.taskMemberships.forEach(({ taskId, userId }) => {
            Task.withId(taskId).users.add(userId);
          });
        }

        break;
      case ActionTypes.CARD_DUPLICATE__SUCCESS:
      case ActionTypes.BOARD_FETCH__SUCCESS:
        if (payload.tasks) {
          payload.tasks.forEach((task) => {
            Task.upsert(task);
          });
        }

        if (payload.taskMemberships) {
          const taskIds = new Set(payload.taskMemberships.map(({ taskId }) => taskId));
          taskIds.forEach((taskId) => {
            Task.withId(taskId).deleteUsers();
          });

          payload.taskMemberships.forEach(({ taskId, userId }) => {
            Task.withId(taskId).users.add(userId);
          });
        }

        break;
      case ActionTypes.TASK_DUPLICATE:
      case ActionTypes.TASK_DUPLICATE_HANDLE:
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_DUPLICATE__SUCCESS:
        Task.upsert(payload.task);

        if (payload.taskMemberships) {
          payload.taskMemberships.forEach(({ taskId, userId }) => {
            Task.withId(taskId).users.add(userId);
          });
        }

        break;
      case ActionTypes.USER_TO_TASK_ADD: {
        const taskModel = Task.withId(payload.taskId);
        taskModel.users.add(payload.id);

        break;
      }
      case ActionTypes.USER_TO_TASK_ADD__SUCCESS:
      case ActionTypes.USER_TO_TASK_ADD_HANDLE:
        try {
          Task.withId(payload.taskMembership.taskId).users.add(payload.taskMembership.userId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.USER_TO_TASK_ADD__FAILURE:
        Task.withId(payload.taskId).users.remove(payload.id);
        break;
      case ActionTypes.USER_FROM_TASK_REMOVE:
        Task.withId(payload.taskId).users.remove(payload.id);

        break;
      case ActionTypes.USER_FROM_TASK_REMOVE__SUCCESS:
      case ActionTypes.USER_FROM_TASK_REMOVE_HANDLE:
        try {
          Task.withId(payload.taskMembership.taskId).users.remove(payload.taskMembership.userId);
        } catch {} // eslint-disable-line no-empty

        break;
      case ActionTypes.USER_FROM_TASK_REMOVE__FAILURE:
        Task.withId(payload.taskId).users.add(payload.id);
        break;
      case ActionTypes.TASK_CREATE:
      case ActionTypes.TASK_CREATE_HANDLE:
      case ActionTypes.TASK_UPDATE__SUCCESS:
      case ActionTypes.TASK_UPDATE_HANDLE:
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_CREATE__SUCCESS:
        Task.withId(payload.localId).delete();
        Task.upsert(payload.task);

        break;
      case ActionTypes.TASK_UPDATE:
        Task.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.TASK_DELETE:
        Task.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.TASK_DELETE__SUCCESS:
      case ActionTypes.TASK_DELETE_HANDLE: {
        const taskModel = Task.withId(payload.task.id);

        if (taskModel) {
          taskModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.ACTIVITIES_TASK_FETCH:
        Task.withId(payload.taskId).update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_TASK_FETCH__SUCCESS:
        Task.withId(payload.taskId).update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
          lastActivityId: payload.activities.length > 0 ? payload.activities[payload.activities.length - 1].id : Task.withId(payload.taskId).lastActivityId,
        });

        break;
      default:
    }
  }

  getOrderedActivitiesQuerySet() {
    return this.activities.filter({ notificationOnly: false }).orderBy('createdAt', false);
  }

  deleteActivities() {
    this.activities.toModelArray().forEach((activityModel) => {
      if (!activityModel.notification) {
        activityModel.delete();
      }
    });
  }

  deleteUsers() {
    this.users.clear();
  }

  deleteClearable() {
    this.deleteUsers();
  }

  deleteRelated() {
    this.deleteActivities();
  }

  deleteWithRelated() {
    this.deleteClearable();
    this.deleteRelated();
    this.delete();
  }
}
