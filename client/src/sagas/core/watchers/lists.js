import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* listsWatchers() {
  yield all([
    takeEvery(EntryActionTypes.LIST_IN_CURRENT_BOARD_CREATE, ({ payload: { data } }) => services.createListInCurrentBoard(data)),
    takeEvery(EntryActionTypes.LIST_CREATE_HANDLE, ({ payload: { list } }) => services.handleListCreate(list)),
    takeEvery(EntryActionTypes.LIST_UPDATE, ({ payload: { id, data } }) => services.updateList(id, data)),
    takeEvery(EntryActionTypes.LIST_UPDATE_HANDLE, ({ payload: { list } }) => services.handleListUpdate(list)),
    takeEvery(EntryActionTypes.LIST_MOVE, ({ payload: { id, index } }) => services.moveList(id, index)),
    takeEvery(EntryActionTypes.LIST_DELETE, ({ payload: { id } }) => services.deleteList(id)),
    takeEvery(EntryActionTypes.LIST_DELETE_HANDLE, ({ payload: { list } }) => services.handleListDelete(list)),
  ]);
}
