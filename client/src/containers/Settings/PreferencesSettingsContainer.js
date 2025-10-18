import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PreferencesSettings from '../../components/Settings/PreferencesSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { language, subscribeToOwnCards, sidebarCompact, defaultView, listViewStyle, usersSettingsStyle, preferredDetailsFont, hideCardModalActivity, hideClosestDueDate, theme, themeShape } =
    selectors.selectCurrentUserPrefs(state);

  return {
    language,
    subscribeToOwnCards,
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
