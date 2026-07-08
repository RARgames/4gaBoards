import EntryActionTypes from '../constants/EntryActionTypes';

const fetchTimeEntries = (params) => ({
  type: EntryActionTypes.TIME_ENTRIES_FETCH,
  payload: {
    params,
  },
});

const createTimeEntry = (data) => ({
  type: EntryActionTypes.TIME_ENTRY_CREATE,
  payload: {
    data,
  },
});

const handleTimeEntryCreate = (timeEntry) => ({
  type: EntryActionTypes.TIME_ENTRY_CREATE_HANDLE,
  payload: {
    timeEntry,
  },
});

const updateTimeEntry = (id, data) => ({
  type: EntryActionTypes.TIME_ENTRY_UPDATE,
  payload: {
    id,
    data,
  },
});

const handleTimeEntryUpdate = (timeEntry) => ({
  type: EntryActionTypes.TIME_ENTRY_UPDATE_HANDLE,
  payload: {
    timeEntry,
  },
});

const deleteTimeEntry = (id) => ({
  type: EntryActionTypes.TIME_ENTRY_DELETE,
  payload: {
    id,
  },
});

const handleTimeEntryDelete = (timeEntry) => ({
  type: EntryActionTypes.TIME_ENTRY_DELETE_HANDLE,
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
