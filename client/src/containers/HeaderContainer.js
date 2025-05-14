import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Header from '../components/Header';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const path = selectors.selectPathConstant(state);
  const isLogouting = selectors.selectIsLogouting(state);
  const currentUser = selectors.selectCurrentUser(state);
  const currentProject = selectors.selectCurrentProject(state);
  const notifications = selectors.selectNotificationsForCurrentUser(state);
  const isCurrentUserManager = selectors.selectIsCurrentUserManagerForCurrentProject(state);
  const { demoMode } = selectors.selectCoreSettings(state);

  return {
    path,
    notifications,
    isLogouting,
    project: currentProject,
    user: currentUser,
    canEditProject: isCurrentUserManager,
    isAdmin: currentUser.isAdmin,
    demoMode,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onNotificationDelete: entryActions.deleteNotification,
      onLogout: entryActions.logout,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
