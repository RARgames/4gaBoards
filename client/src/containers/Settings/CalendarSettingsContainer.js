import { connect } from 'react-redux';

import CalendarSettings from '../../components/Settings/CalendarSettings';
import selectors from '../../selectors';

// Connections and linked calendars are admin configuration the component fetches itself, so this
// supplies only what the store already holds: the project list, and the access token those direct
// api calls have to carry themselves (the saga request helper is what normally attaches it).
const mapStateToProps = (state) => {
  const { projects } = selectors.selectProjectsForCurrentUser(state);
  const accessToken = selectors.selectAccessToken(state);

  return {
    accessToken,
    projects,
  };
};

export default connect(mapStateToProps)(CalendarSettings);
