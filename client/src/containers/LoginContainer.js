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
    googleSsoEnabled: coreSettings ? coreSettings.googleSsoEnabled : false,
    githubSsoEnabled: coreSettings ? coreSettings.githubSsoEnabled : false,
    registrationEnabled: coreSettings ? coreSettings.registrationEnabled : false,
    localRegistrationEnabled: coreSettings ? coreSettings.localRegistrationEnabled : false,
    ssoRegistrationEnabled: coreSettings ? coreSettings.ssoRegistrationEnabled : false,
    error,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateGoogleSso: entryActions.authenticateGoogleSso,
      onAuthenticateGithubSso: entryActions.authenticateGithubSso,
      onMessageDismiss: entryActions.clearAuthenticateError,
      onRegisterOpen: entryActions.registerOpen,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
