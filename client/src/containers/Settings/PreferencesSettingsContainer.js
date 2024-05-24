import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import PreferencesSettings from '../../components/Settings/PreferencesSettings';

const mapStateToProps = (state) => {
  const { language, subscribeToOwnCards } = selectors.selectCurrentUser(state);

  return {
    language,
    subscribeToOwnCards,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateCurrentUser,
      onLanguageUpdate: entryActions.updateCurrentUserLanguage,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PreferencesSettings);
