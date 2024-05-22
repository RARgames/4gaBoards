import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import InstanceSettings from '../components/InstanceSettings';

const mapStateToProps = (state) => {
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    registrationEnabled: coreSettings.registrationEnabled,
    localRegistrationEnabled: coreSettings.localRegistrationEnabled,
    ssoRegistrationEnabled: coreSettings.ssoRegistrationEnabled,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCoreSettingsUpdate: entryActions.updateCoreSettings,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InstanceSettings);
