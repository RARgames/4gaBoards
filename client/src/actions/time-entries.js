import ActionTypes from '../constants/ActionTypes';

const fetchTimeEntries = (params) => ({
  type: ActionTypes.TIME_ENTRIES_FETCH,
  payload: {
    params,
  },
});

fetchTimeEntries.success = (params, timeEntries) => ({
  type: ActionTypes.TIME_ENTRIES_FETCH__SUCCESS,
  payload: {
    params,
    timeEntries,
  },
});

fetchTimeEntries.failure = (params, error) => ({
  type: ActionTypes.TIME_ENTRIES_FETCH__FAILURE,
  payload: {
    params,
    error,
  },
});

const createTimeEntry = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_CREATE,
  payload: {
    timeEntry,
  },
});

createTimeEntry.success = (localId, timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_CREATE__SUCCESS,
  payload: {
    localId,
    timeEntry,
  },
});

createTimeEntry.failure = (localId, error) => ({
  type: ActionTypes.TIME_ENTRY_CREATE__FAILURE,
  payload: {
    localId,
    error,
  },
});

const handleTimeEntryCreate = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_CREATE_HANDLE,
  payload: {
    timeEntry,
  },
});

const updateTimeEntry = (id, data) => ({
  type: ActionTypes.TIME_ENTRY_UPDATE,
  payload: {
    id,
    data,
  },
});

updateTimeEntry.success = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_UPDATE__SUCCESS,
  payload: {
    timeEntry,
  },
});

updateTimeEntry.failure = (id, error, prevTimeEntry) => ({
  type: ActionTypes.TIME_ENTRY_UPDATE__FAILURE,
  payload: {
    id,
    error,
    prevTimeEntry,
  },
});

const handleTimeEntryUpdate = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_UPDATE_HANDLE,
  payload: {
    timeEntry,
  },
});

const deleteTimeEntry = (id) => ({
  type: ActionTypes.TIME_ENTRY_DELETE,
  payload: {
    id,
  },
});

deleteTimeEntry.success = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_DELETE__SUCCESS,
  payload: {
    timeEntry,
  },
});

deleteTimeEntry.failure = (id, error, prevTimeEntry) => ({
  type: ActionTypes.TIME_ENTRY_DELETE__FAILURE,
  payload: {
    id,
    error,
    prevTimeEntry,
  },
});

const handleTimeEntryDelete = (timeEntry) => ({
  type: ActionTypes.TIME_ENTRY_DELETE_HANDLE,
  payload: {
    timeEntry,
  },
});

export default {
  fetchTimeEntries,
  createTimeEntry,
  handleTimeEntryCreate,
  updateTimeEntry,
  handleTimeEntryUpdate,
  deleteTimeEntry,
  handleTimeEntryDelete,
};
