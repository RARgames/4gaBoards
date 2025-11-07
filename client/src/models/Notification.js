import { attr, fk, oneToOne } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Notification';

  static fields = {
    id: attr(),
    type: attr(),
    data: attr(),
    isRead: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'notifications',
    }),
    cardId: fk({
      to: 'Card',
      as: 'card',
      relatedName: 'notifications',
    }),
    activityId: oneToOne({
      to: 'Activity',
      as: 'activity',
    }),
    deletedAt: attr(),
  };

  static reducer({ type, payload }, Notification) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.notifications) {
          payload.notifications.forEach((notification) => {
            const n = Notification.withId(notification.id);
            if (n) {
              n.update(notification);
            } else {
              Notification.upsert(notification);
            }
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Notification.all().delete();

        payload.notifications.forEach((notification) => {
          Notification.upsert(notification);
        });

        break;
      case ActionTypes.CORE_INITIALIZE:
        payload.notifications.forEach((notification) => {
          Notification.upsert(notification);
        });

        break;
      case ActionTypes.NOTIFICATION_CREATE_HANDLE:
        Notification.upsert(payload.notification);

        break;
      case ActionTypes.NOTIFICATION_UPDATE: {
        const notification = Notification.withId(payload.id);

        if (notification) {
          notification.update(payload.data);

          // TODO hacky way to trigger re-render so the notification is counted as unread
          Notification.upsert({ id: 'local:notification_reload', cardId: notification.cardId, userId: notification.userId });
          Notification.withId('local:notification_reload').delete();
        }

        break;
      }
      case ActionTypes.NOTIFICATION_UPDATE__SUCCESS:
      case ActionTypes.NOTIFICATION_UPDATE_HANDLE:
        Notification.upsert(payload.notification);

        break;
      case ActionTypes.NOTIFICATION_MARK_ALL_AS:
        Notification.all()
          .toModelArray()
          .forEach((notification) => {
            notification.update({ isRead: true });
          });

        break;
      case ActionTypes.NOTIFICATION_MARK_ALL_AS__SUCCESS:
      case ActionTypes.NOTIFICATION_MARK_ALL_AS_HANDLE:
        if (payload.notifications) {
          payload.notifications.forEach((notification) => {
            const n = Notification.withId(notification.id);
            if (n) {
              n.update(notification);
            } else {
              Notification.upsert(notification);
            }
          });
        }

        break;
      case ActionTypes.NOTIFICATION_DELETE:
        Notification.withId(payload.id).deleteWithRelated();

        break;
      case ActionTypes.NOTIFICATION_DELETE__SUCCESS:
      case ActionTypes.NOTIFICATION_DELETE_HANDLE: {
        const notificationModel = Notification.withId(payload.notification.id);

        if (notificationModel) {
          notificationModel.deleteWithRelated();
        }

        break;
      }
      case ActionTypes.NOTIFICATION_DELETE_ALL:
        if (payload.data && payload.data.deleteIsReadOnly) {
          Notification.all()
            .toModelArray()
            .forEach((notification) => {
              if (notification.isRead) {
                notification.deleteWithRelated();
              }
            });
        } else {
          Notification.all()
            .toModelArray()
            .forEach((notification) => {
              notification.deleteWithRelated();
            });
        }
        break;
      case ActionTypes.NOTIFICATION_DELETE_ALL__SUCCESS:
      case ActionTypes.NOTIFICATION_DELETE_ALL_HANDLE:
        if (payload.notifications) {
          payload.notifications.forEach((notification) => {
            const notificationModel = Notification.withId(notification.id);

            if (notificationModel) {
              notificationModel.deleteWithRelated();
            }
          });
        }

        break;
      default:
    }
  }

  deleteRelated() {
    if (this.action && !this.action.isInCard) {
      this.action.delete();
    }
  }

  deleteWithRelated() {
    this.deleteRelated();
    this.delete();
  }
}
