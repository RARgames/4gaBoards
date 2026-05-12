import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* boardTemplatesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_CREATE, ({ payload: { boardId, data } }) => services.createBoardTemplate(boardId, data)),
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_CREATE_HANDLE, ({ payload: { boardTemplate } }) => services.handleBoardTemplateCreate(boardTemplate)),
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_UPDATE, ({ payload: { id, data } }) => services.updateBoardTemplate(id, data)),
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_UPDATE_HANDLE, ({ payload: { boardTemplate } }) => services.handleBoardTemplateUpdate(boardTemplate)),
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_DELETE, ({ payload: { id } }) => services.deleteBoardTemplate(id)),
    takeEvery(EntryActionTypes.BOARD_TEMPLATE_DELETE_HANDLE, ({ payload: { boardTemplate } }) => services.handleBoardTemplateDelete(boardTemplate)),
  ]);
}
