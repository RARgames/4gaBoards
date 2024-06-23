import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import AccountSettings from '../../components/Settings/AccountSettings';

const mapStateToProps = (state) => {
  const { email, username, emailUpdateForm, usernameUpdateForm, ssoGoogleEmail } = selectors.selectCurrentUser(state);
  return {
    email,
    username,
    emailUpdateForm,
    usernameUpdateForm,
    ssoGoogleEmail,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUsernameUpdate: entryActions.updateCurrentUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearCurrentUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateCurrentUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearCurrentUserEmailUpdateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
