import { attr } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'UserPrefs';

  static fields = {
    id: attr(),
    language: attr(),
    subscribeToOwnCards: attr(),
    descriptionMode: attr(),
    commentMode: attr(),
    descriptionShown: attr(),
    tasksShown: attr(),
    attachmentsShown: attr(),
    commentsShown: attr(),
    sidebarCompact: attr(),
  };

  static reducer({ type, payload }, UserPrefs) {
    switch (type) {
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        UserPrefs.delete();
        UserPrefs.upsert(payload.userPrefs);
        break;

      case ActionTypes.CORE_INITIALIZE:
        UserPrefs.upsert(payload.userPrefs);
        break;

      case ActionTypes.USER_PREFS_UPDATE:
        UserPrefs.withId(payload.id).update(payload.data);
        break;

      case ActionTypes.USER_PREFS_UPDATE__SUCCESS:
      case ActionTypes.USER_PREFS_UPDATE_HANDLE:
        UserPrefs.upsert(payload.userPrefs);
        break;

      case ActionTypes.USER_PREFS_UPDATE__FAILURE:
        UserPrefs.upsert(payload.userPrefs);
        break;

      default:
    }
  }
}
