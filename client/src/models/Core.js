import { attr } from 'redux-orm';

import BaseModel from './BaseModel';
import ActionTypes from '../constants/ActionTypes';

export default class extends BaseModel {
  static modelName = 'Core';

  static fields = {
    id: attr(),
    registrationEnabled: attr(),
    localRegistrationEnabled: attr(),
    ssoRegistrationEnabled: attr(),
  };

  static reducer({ type, payload }, Core) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        if (payload.core) {
          // Core.upsert(payload.core.data);
          // TODO not implemented - send core settings on reconnect
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
