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
  const accessToken = selectors.selectAccessToken(state);

  return {
    isAdmin: !!(currentUser && currentUser.isAdmin),
    users,
    overview,
    projects,
    accessToken,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onFetch: entryActions.fetchTimesheetOverview,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TeamOverview);
