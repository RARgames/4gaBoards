import EntryActionTypes from '../constants/EntryActionTypes';

const fetchMembersOverview = () => ({
  type: EntryActionTypes.MEMBERS_OVERVIEW_FETCH,
  payload: {},
});

export default {
  fetchMembersOverview,
};
