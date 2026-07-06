import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PreferencesSettings from '../../components/Settings/PreferencesSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const {
    language,
    subscribeToOwnCards,
    subscribeToNewBoards,
    subscribeToNewProjects,
    subscribeToUsers,
    subscribeToInstance,
    sidebarCompact,
    defaultView,
    listViewStyle,
    usersSettingsStyle,
    preferredDetailsFont,
    hideCardModalActivity,
    hideClosestDueDate,
    showFullDueDates,
    theme,
    themeShape,
    emailNotificationsEnabled,
    emailNotificationsTypes,
    emailNotificationsDeliveryMode,
    emailNotificationsMarkReadAsDelivered,
    notificationTypes,
    suppressedSystemNotificationTags,
  } = selectors.selectCurrentUserPrefs(state);
  const { isAdmin, isVerified } = selectors.selectCurrentUser(state);

  return {
    isAdmin,
    isVerified,
    language,
    subscribeToOwnCards,
    subscribeToNewBoards,
    subscribeToNewProjects,
    subscribeToUsers,
    subscribeToInstance,
    sidebarCompact,
    defaultView,
    listViewStyle,
    usersSettingsStyle,
    preferredDetailsFont,
    hideCardModalActivity,
    hideClosestDueDate,
    showFullDueDates,
    theme,
    themeShape,
    emailNotificationsEnabled,
    emailNotificationsTypes,
    emailNotificationsDeliveryMode,
    emailNotificationsMarkReadAsDelivered,
    notificationTypes,
    suppressedSystemNotificationTags,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUserPrefs,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesSettings);
