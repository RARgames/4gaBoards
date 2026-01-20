import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import Config from '../constants/Config';
import { ActivityScopes } from '../constants/Enums';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Core';

  static fields = {
    id: attr(),
    registrationEnabled: attr(),
    localRegistrationEnabled: attr(),
    ssoRegistrationEnabled: attr(),
    projectCreationAllEnabled: attr(),
    syncSsoDataOnAuth: attr(),
    syncSsoAdminOnAuth: attr(),
    allowedRegisterDomains: attr(),
    demoMode: attr(),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdCoreSettings',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedCoreSettings',
    }),
    isActivitiesFetching: attr({
      getDefault: () => false,
    }),
    isAllActivitiesFetched: attr({
      getDefault: () => false,
    }),
    lastActivityId: attr(),
  };

  static reducer({ type, payload }, Core) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
        if (payload.core) {
          const { item } = payload.core;
          item.id = '0'; // TODO this is quick fix, need to get proper item from Action, also this may fix the need of extra calling of FetchCoreSettingsPublic
          Core.upsert(item);
        }
        break;
      case ActionTypes.FETCH_CORE_SETTINGS_PUBLIC:
      case ActionTypes.CORE_SETTINGS_UPDATE__SUCCESS:
      case ActionTypes.CORE_SETTINGS_UPDATE_HANDLE:
        Core.upsert(payload.data);
        break;
      case ActionTypes.ACTIVITIES_INSTANCE_FETCH:
        Core.withId('0').update({
          isActivitiesFetching: true,
        });

        break;
      case ActionTypes.ACTIVITIES_INSTANCE_FETCH__SUCCESS:
        Core.withId('0').update({
          isActivitiesFetching: false,
          isAllActivitiesFetched: payload.activities.length < Config.ACTIVITIES_LIMIT,
          lastActivityId: payload.activities.length > 0 ? payload.activities[payload.activities.length - 1].id : Core.withId('0').lastActivityId,
        });

        break;
      default:
    }
  }

  getOrderedActivitiesQuerySet() {
    return this.activities.filter({ notificationOnly: false, scope: ActivityScopes.INSTANCE }).orderBy('createdAt', false);
  }

  getUnreadNotificationsQuerySet() {
    return this.notifications.filter({
      isRead: false,
      deletedAt: null,
    });
  }

  getUnreadInstanceNotificationsModelArray() {
    return this.notifications
      .filter({
        isRead: false,
        deletedAt: null,
      })
      .toModelArray()
      .filter((n) => n.activity && n.activity.scope === ActivityScopes.INSTANCE);
  }

  getUnreadUsersNotificationsModelArray() {
    return this.notifications
      .filter({
        isRead: false,
        deletedAt: null,
      })
      .toModelArray()
      .filter((n) => n.activity && n.activity.scope === ActivityScopes.USER);
  }
}
