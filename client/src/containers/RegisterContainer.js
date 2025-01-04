import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Register from '../components/Register';
import entryActions from '../entry-actions';
import selectors from '../selectors';

const mapStateToProps = (state) => {
  const {
    ui: {
      registerForm: { data: defaultData, isSubmitting, error },
    },
  } = state;
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    defaultData,
    isSubmitting,
    googleSsoEnabled: coreSettings ? coreSettings.googleSsoEnabled : false,
    registrationEnabled: coreSettings ? coreSettings.registrationEnabled : false,
    localRegistrationEnabled: coreSettings ? coreSettings.localRegistrationEnabled : false,
    ssoRegistrationEnabled: coreSettings ? coreSettings.ssoRegistrationEnabled : false,
    error,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onRegister: entryActions.register,
      onAuthenticateGoogleSso: entryActions.authenticateGoogleSso,
      onMessageDismiss: entryActions.clearRegisterError,
      onLoginOpen: entryActions.loginOpen,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Register);
