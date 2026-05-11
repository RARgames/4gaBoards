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
  const { ssoAvailable, oidcEnabledMethods, registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled } = selectors.selectCoreSettings(state);

  return {
    defaultData,
    isSubmitting,
    ssoAvailable,
    oidcEnabledMethods,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    error,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onRegister: entryActions.register,
      onAuthenticateSso: entryActions.authenticateSso,
      onMessageDismiss: entryActions.clearRegisterError,
      onLoginOpen: entryActions.loginOpen,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Register);
