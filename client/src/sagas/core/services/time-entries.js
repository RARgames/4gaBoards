import { call, put, select } from 'redux-saga/effects';

import actions from '../../../actions';
import api from '../../../api';
import selectors from '../../../selectors';
import { createLocalId } from '../../../utils/local-id';
import request from '../request';

export function* fetchTimeEntries(params) {
  yield put(actions.fetchTimeEntries(params));

  let timeEntries;
  try {
    ({ items: timeEntries } = yield call(request, api.getTimeEntries, params));
  } catch (error) {
    yield put(actions.fetchTimeEntries.failure(params, error));
    return;
  }

  yield put(actions.fetchTimeEntries.success(params, timeEntries));
}

export function* createTimeEntry(data) {
  const localId = yield call(createLocalId);

  yield put(
    actions.createTimeEntry({
      ...data,
      id: localId,
    }),
  );

  let timeEntry;
  try {
    ({ item: timeEntry } = yield call(request, api.createTimeEntry, data));
  } catch (error) {
    yield put(actions.createTimeEntry.failure(localId, error));
    return;
  }

  yield put(actions.createTimeEntry.success(localId, timeEntry));
}

export function* handleTimeEntryCreate(timeEntry) {
  yield put(actions.handleTimeEntryCreate(timeEntry));
}

export function* updateTimeEntry(id, data) {
  // Captured before the optimistic dispatch below overwrites it, so a rejected update (e.g. an
  // overlap conflict) can be rolled back to what the server actually still has.
  const prevTimeEntry = yield select(selectors.selectTimeEntryById, id);

  yield put(actions.updateTimeEntry(id, data));

  let timeEntry;
  try {
    ({ item: timeEntry } = yield call(request, api.updateTimeEntry, id, data));
  } catch (error) {
    yield put(actions.updateTimeEntry.failure(id, error, prevTimeEntry));
    return;
  }

  yield put(actions.updateTimeEntry.success(timeEntry));
}

export function* handleTimeEntryUpdate(timeEntry) {
  yield put(actions.handleTimeEntryUpdate(timeEntry));
}

export function* deleteTimeEntry(id) {
  // Captured before the optimistic delete below removes it, so a rejected deletion can restore it.
  const prevTimeEntry = yield select(selectors.selectTimeEntryById, id);

  yield put(actions.deleteTimeEntry(id));

  let timeEntry;
  try {
    ({ item: timeEntry } = yield call(request, api.deleteTimeEntry, id));
  } catch (error) {
    yield put(actions.deleteTimeEntry.failure(id, error, prevTimeEntry));
    return;
  }

  yield put(actions.deleteTimeEntry.success(timeEntry));
}

export function* handleTimeEntryDelete(timeEntry) {
  yield put(actions.handleTimeEntryDelete(timeEntry));
}

export default {
  fetchTimeEntries,
  createTimeEntry,
  handleTimeEntryCreate,
  updateTimeEntry,
  handleTimeEntryUpdate,
  deleteTimeEntry,
  handleTimeEntryDelete,
};
