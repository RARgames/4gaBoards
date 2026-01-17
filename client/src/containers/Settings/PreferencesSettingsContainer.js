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
    theme,
    themeShape,
  } = selectors.selectCurrentUserPrefs(state);
  const { isAdmin } = selectors.selectCurrentUser(state);

  return {
    isAdmin,
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
    theme,
    themeShape,
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
