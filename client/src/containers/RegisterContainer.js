import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import selectors from '../selectors';
import entryActions from '../entry-actions';
import Register from '../components/Register';

const mapStateToProps = (state) => {
  const {
    ui: {
      registerForm: { data: defaultData, isSubmitting, error },
    },
  } = state;
  const googleSsoEnabled = selectors.selectSsoEnabled(state);
  const registrationEnabled = selectors.selectRegistrationEnabled(state);
  const localRegistrationEnabled = selectors.selectLocalRegistrationEnabled(state);
  const ssoRegistrationEnabled = selectors.selectSsoRegistrationEnabled(state);

  return {
    defaultData,
    isSubmitting,
    googleSsoEnabled,
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
      onAuthenticateGoogleSso: entryActions.authenticateGoogleSso,
      onMessageDismiss: entryActions.clearRegisterError,
      onLoginOpen: entryActions.loginOpen,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Register);
