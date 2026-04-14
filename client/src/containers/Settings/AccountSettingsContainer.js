import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AccountSettings from '../../components/Settings/AccountSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { email, isVerified, username, isPasswordAuthenticated, emailUpdateForm, usernameUpdateForm } = selectors.selectCurrentUser(state);

  return {
    email,
    isVerified,
    username,
    isPasswordAuthenticated,
    emailUpdateForm,
    usernameUpdateForm,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUsernameUpdate: entryActions.updateCurrentUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearCurrentUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateCurrentUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearCurrentUserEmailUpdateError,
      onEmailVerificationResend: entryActions.resendCurrentUserEmailVerification,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
