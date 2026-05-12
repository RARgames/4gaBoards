import { attr, fk } from 'redux-orm';

import ActionTypes from '../constants/ActionTypes';
import BaseModel from './BaseModel';

export default class extends BaseModel {
  static modelName = 'BoardTemplate';

  static fields = {
    id: attr(),
    name: attr(),
    isGlobal: attr(),
    data: attr(),
    createdById: fk({
      to: 'User',
      as: 'createdBy',
      relatedName: 'createdBoardTemplates',
    }),
    updatedById: fk({
      to: 'User',
      as: 'updatedBy',
      relatedName: 'updatedBoardTemplates',
    }),
    createdAt: attr(),
    updatedAt: attr(),
  };

  static reducer({ type, payload }, BoardTemplate) {
    switch (type) {
      case ActionTypes.CORE_INITIALIZE:
        if (payload.boardTemplates) {
          payload.boardTemplates.forEach((boardTemplate) => {
            BoardTemplate.upsert(boardTemplate);
          });
        }

        break;
      case ActionTypes.BOARD_TEMPLATE_CREATE__SUCCESS:
      case ActionTypes.BOARD_TEMPLATE_UPDATE__SUCCESS:
      case ActionTypes.BOARD_TEMPLATE_CREATE_HANDLE:
      case ActionTypes.BOARD_TEMPLATE_UPDATE_HANDLE:
        BoardTemplate.upsert(payload.boardTemplate);

        break;
      case ActionTypes.BOARD_TEMPLATE_DELETE__SUCCESS:
      case ActionTypes.BOARD_TEMPLATE_DELETE_HANDLE:
        BoardTemplate.withId(payload.boardTemplate.id)?.delete();

        break;
      default:
    }
  }
}
