import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InstanceSettings from '../../components/Settings/InstanceSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled, projectCreationAllEnabled, demoMode } = selectors.selectCoreSettings(state);

  return {
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    projectCreationAllEnabled,
    demoMode,
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
