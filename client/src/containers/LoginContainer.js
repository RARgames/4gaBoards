import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Login from '../components/Login';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const {
    ui: {
      authenticateForm: { data: defaultData, isSubmitting, error },
    },
  } = state;
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    defaultData,
    isSubmitting,
    ssoAvailable: coreSettings.ssoAvailable,
    registrationEnabled: coreSettings.registrationEnabled,
    localRegistrationEnabled: coreSettings.localRegistrationEnabled,
    ssoRegistrationEnabled: coreSettings.ssoRegistrationEnabled,
    error,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateSso: entryActions.authenticateSso,
      onMessageDismiss: entryActions.clearAuthenticateError,
      onRegisterOpen: entryActions.registerOpen,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
