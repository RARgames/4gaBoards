import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Label';

  static fields = {
    id: attr(),
    name: attr(),
    color: attr(),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'labels',
    }),
    createdAt: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdLabels',
    }),
    updatedAt: attr(),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedLabels',
    }),
  };

  static reducer({ type, payload }, Label) {
    switch (type) {
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
      case ActionTypes.BOARD_MEMBERSHIP_CREATE_HANDLE:
        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        Label.all().delete();

        if (payload.labels) {
          payload.labels.forEach((label) => {
            Label.upsert(label);
          });
        }

        break;
      case ActionTypes.BOARD_FETCH__SUCCESS:
        payload.labels.forEach((label) => {
          Label.upsert(label);
        });

        break;
      case ActionTypes.LABEL_CREATE:
      case ActionTypes.LABEL_CREATE_HANDLE:
      case ActionTypes.LABEL_UPDATE__SUCCESS:
      case ActionTypes.LABEL_UPDATE_HANDLE:
        Label.upsert(payload.label);
        break;

      case ActionTypes.LABEL_UPDATE__FAILURE:
        Label.upsert(payload.label);
        break;

      case ActionTypes.LABEL_CREATE__SUCCESS:
        Label.withId(payload.localId).delete();
        Label.upsert(payload.label);

        break;
      case ActionTypes.LABEL_CREATE__FAILURE:
        Label.withId(payload.localId).delete();
        break;

      case ActionTypes.LABEL_UPDATE:
        Label.withId(payload.id).update(payload.data);

        break;
      case ActionTypes.LABEL_DELETE:
        Label.withId(payload.id).delete();

        break;
      case ActionTypes.LABEL_DELETE__SUCCESS:
      case ActionTypes.LABEL_DELETE_HANDLE: {
        const labelModel = Label.withId(payload.label.id);

        if (labelModel) {
          labelModel.delete();
        }

        break;
      }
      default:
    }
  }
}
