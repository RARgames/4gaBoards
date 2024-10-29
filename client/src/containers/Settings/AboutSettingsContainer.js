import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import selectors from '../../selectors';

import AboutSettings from '../../components/Settings/AboutSettings';

const mapStateToProps = (state) => {
  const { language } = selectors.selectCurrentUser(state);
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    language,
    demoMode: coreSettings.demoMode,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AboutSettings);
