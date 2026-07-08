import ActionTypes from '../constants/ActionTypes';

const fetchMembersOverview = () => ({
  type: ActionTypes.MEMBERS_OVERVIEW_FETCH,
  payload: {},
});

fetchMembersOverview.success = (items) => ({
  type: ActionTypes.MEMBERS_OVERVIEW_FETCH__SUCCESS,
  payload: {
    items,
  },
});

fetchMembersOverview.failure = (error) => ({
  type: ActionTypes.MEMBERS_OVERVIEW_FETCH__FAILURE,
  payload: {
    error,
  },
});

export default {
  fetchMembersOverview,
};
