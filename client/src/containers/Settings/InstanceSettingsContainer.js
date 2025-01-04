import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InstanceSettings from '../../components/Settings/InstanceSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

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
