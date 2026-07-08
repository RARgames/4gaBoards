import { all, takeEvery } from 'redux-saga/effects';

import EntryActionTypes from '../../../constants/EntryActionTypes';
import services from '../services';

export default function* timeEntriesWatchers() {
  yield all([
    takeEvery(EntryActionTypes.TIME_ENTRIES_FETCH, ({ payload: { params } }) => services.fetchTimeEntries(params)),
    takeEvery(EntryActionTypes.TIME_ENTRY_CREATE, ({ payload: { data } }) => services.createTimeEntry(data)),
    takeEvery(EntryActionTypes.TIME_ENTRY_CREATE_HANDLE, ({ payload: { timeEntry } }) => services.handleTimeEntryCreate(timeEntry)),
    takeEvery(EntryActionTypes.TIME_ENTRY_UPDATE, ({ payload: { id, data } }) => services.updateTimeEntry(id, data)),
    takeEvery(EntryActionTypes.TIME_ENTRY_UPDATE_HANDLE, ({ payload: { timeEntry } }) => services.handleTimeEntryUpdate(timeEntry)),
    takeEvery(EntryActionTypes.TIME_ENTRY_DELETE, ({ payload: { id } }) => services.deleteTimeEntry(id)),
    takeEvery(EntryActionTypes.TIME_ENTRY_DELETE_HANDLE, ({ payload: { timeEntry } }) => services.handleTimeEntryDelete(timeEntry)),
  ]);
}
