import EntryActionTypes from '../constants/EntryActionTypes';

const fetchTimesheetOverview = (params) => ({
  type: EntryActionTypes.TIMESHEET_OVERVIEW_FETCH,
  payload: {
    params,
  },
});

export default {
  fetchTimesheetOverview,
};
