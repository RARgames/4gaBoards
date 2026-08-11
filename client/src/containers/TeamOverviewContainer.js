import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TeamOverview from '../components/Timesheet/TeamOverview';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const currentUser = selectors.selectCurrentUser(state);
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const users = selectors.selectUsers(state);
  const overview = selectors.selectTimesheetOverview(state);
  const timeEntries = selectors.selectTimeEntries(state);
  const accessToken = selectors.selectAccessToken(state);
  const categoryTags = selectors.selectCategoryTags(state);
  const { timezone } = selectors.selectCurrentUserPrefs(state) || {};

  return {
    isAdmin: !!(currentUser && currentUser.isAdmin),
    users,
    overview,
    projects,
    timeEntries,
    accessToken,
    categoryTags: categoryTags.items,
    timezone,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onFetch: entryActions.fetchTimesheetOverview,
      onFetchTimeEntries: entryActions.fetchTimeEntries,
      onFetchCategoryTags: entryActions.fetchCategoryTags,
      onTimezoneChange: (timezone) => entryActions.updateCurrentUserPrefs({ timezone }),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TeamOverview);
