import { attr } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Core';

  static fields = {
    id: attr(),
    registrationEnabled: attr(),
    localRegistrationEnabled: attr(),
    ssoRegistrationEnabled: attr(),
    demoMode: attr(),
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
