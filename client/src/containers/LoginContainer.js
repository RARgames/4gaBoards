import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import selectors from '../selectors';
import entryActions from '../entry-actions';
import Login from '../components/Login';

const mapStateToProps = (state) => {
  const {
    ui: {
      authenticateForm: { data: defaultData, isSubmitting, error },
    },
  } = state;
  const googleSsoUrl = selectors.selectGoogleSsoUrl(state);
  let googleSsoEnabled = false;
  if (googleSsoUrl) {
    if (googleSsoUrl.googleSsoUrl.enabled !== 'false') {
      googleSsoEnabled = true;
    }
  }
  return {
    defaultData,
    isSubmitting,
    googleSsoEnabled,
    error,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onAuthenticate: entryActions.authenticate,
      onAuthenticateGoogleSso: entryActions.authenticateGoogleSso,
      onMessageDismiss: entryActions.clearAuthenticateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
