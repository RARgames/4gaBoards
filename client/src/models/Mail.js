import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'Mail';

  static fields = {
    id: attr(),
    mailId: attr(),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'mails',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'mails',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'mails',
    }),
  };

  static reducer({ type, payload }, Mail) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.BOARD_UPDATE__SUCCESS:
      case ActionTypes.BOARD_UPDATE_HANDLE:
      case ActionTypes.BOARD_DELETE__SUCCESS:
      case ActionTypes.BOARD_DELETE_HANDLE:
        if (payload.mails) {
          payload.mails.forEach((mail) => {
            Mail.upsert(mail);
          });
        }
        break;

      case ActionTypes.MAIL_CREATE__SUCCESS:
      case ActionTypes.MAIL_UPDATE__SUCCESS:
      case ActionTypes.MAIL_CREATE_HANDLE:
      case ActionTypes.MAIL_UPDATE_HANDLE:
        Mail.upsert(payload.mail);
        break;
      default:
    }
  }
}
