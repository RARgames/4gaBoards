import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'ApiClient';

  static fields = {
    id: attr(),
    name: attr(),
    label: attr(),
    clientId: attr(),
    clientSecret: attr(),
    permissions: attr(),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'apiClients',
    }),
    lastUsedAt: attr(),
    createdAt: attr(),
    updatedAt: attr(),
    deletedAt: attr(),
  };

  static reducer({ type, payload }, ApiClient) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
        if (payload.apiClients) {
          payload.apiClients.forEach((apiClient) => {
            ApiClient.upsert(apiClient);
          });
        }

        break;
      case ActionTypes.API_CLIENT_UPDATE:
        if (payload.data.regenerateSecret) {
          ApiClient.withId(payload.id).update({ clientSecret: '' });
        }

        break;
      case ActionTypes.API_CLIENT_CREATE__SUCCESS:
      case ActionTypes.API_CLIENT_UPDATE__SUCCESS:
      case ActionTypes.API_CLIENT_CREATE_HANDLE:
      case ActionTypes.API_CLIENT_UPDATE_HANDLE:
        ApiClient.upsert(payload.apiClient);

        break;
      case ActionTypes.API_CLIENT_DELETE__SUCCESS:
      case ActionTypes.API_CLIENT_DELETE_HANDLE:
        ApiClient.withId(payload.apiClient.id)?.delete();

        break;
      default:
    }
  }
}
