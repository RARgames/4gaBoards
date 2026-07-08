import ActionTypes from '../constants/ActionTypes';

const fetchTimesheetOverview = () => ({
  type: ActionTypes.TIMESHEET_OVERVIEW_FETCH,
  payload: {},
});

fetchTimesheetOverview.success = (items) => ({
  type: ActionTypes.TIMESHEET_OVERVIEW_FETCH__SUCCESS,
  payload: {
    items,
  },
});

fetchTimesheetOverview.failure = (error) => ({
  type: ActionTypes.TIMESHEET_OVERVIEW_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  fetchTimesheetOverview,
};
