import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'MailToken';

  static fields = {
    id: attr(),
    token: attr(),
    listId: fk({
      to: 'List',
      as: 'list',
      relatedName: 'mailTokens',
    }),
    boardId: fk({
      to: 'Board',
      as: 'board',
      relatedName: 'mailTokens',
    }),
    projectId: fk({
      to: 'Project',
      as: 'project',
      relatedName: 'mailTokens',
    }),
    userId: fk({
      to: 'User',
      as: 'user',
      relatedName: 'mailTokens',
    }),
  };

  static reducer({ type, payload }, MailToken) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
      case ActionTypes.LOCATION_CHANGE_HANDLE:
      case ActionTypes.BOARD_FETCH__SUCCESS:
      case ActionTypes.BOARD_UPDATE__SUCCESS:
      case ActionTypes.BOARD_UPDATE_HANDLE:
      case ActionTypes.BOARD_DELETE__SUCCESS:
      case ActionTypes.BOARD_DELETE_HANDLE:
      case ActionTypes.PROJECT_MANAGER_CREATE_HANDLE:
        if (payload.mailTokens) {
          payload.mailTokens.forEach((mailToken) => {
            MailToken.upsert(mailToken);
          });
        }

        break;
      case ActionTypes.PROJECT_MANAGER_DELETE__SUCCESS:
      case ActionTypes.PROJECT_MANAGER_DELETE_HANDLE: {
        const { userId, projectId } = payload.projectManager;
        MailToken.all()
          .filter((mailToken) => mailToken.projectId === projectId && mailToken.userId !== userId)
          .delete();

        break;
      }
      case ActionTypes.SOCKET_RECONNECT_HANDLE:
        MailToken.all().delete();

        if (payload.mailTokens) {
          payload.mailTokens.forEach((mailToken) => {
            MailToken.upsert(mailToken);
          });
        }

        break;
      case ActionTypes.MAIL_TOKEN_CREATE__SUCCESS:
      case ActionTypes.MAIL_TOKEN_UPDATE__SUCCESS:
      case ActionTypes.MAIL_TOKEN_CREATE_HANDLE:
      case ActionTypes.MAIL_TOKEN_UPDATE_HANDLE:
        MailToken.upsert(payload.mailToken);
        break;
      case ActionTypes.MAIL_TOKEN_DELETE__SUCCESS:
      case ActionTypes.MAIL_TOKEN_DELETE_HANDLE:
        MailToken.withId(payload.mailToken.id)?.delete();
        break;

      default:
    }
  }
}
