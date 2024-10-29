import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import InstanceSettings from '../../components/Settings/InstanceSettings';

const mapStateToProps = (state) => {
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    registrationEnabled: coreSettings.registrationEnabled,
    localRegistrationEnabled: coreSettings.localRegistrationEnabled,
    ssoRegistrationEnabled: coreSettings.ssoRegistrationEnabled,
    demoMode: coreSettings.demoMode,
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
