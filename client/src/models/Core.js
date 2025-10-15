import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
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
      default:
    }
  }
}
