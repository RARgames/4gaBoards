import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PreferencesSettingsTheme from '../../components/Settings/PreferencesSettingsTheme';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { themeCustomColors } = selectors.selectCurrentUserPrefs(state);

  return {
    themeCustomColors,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUserPrefs,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesSettingsTheme);
