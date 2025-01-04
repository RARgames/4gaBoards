import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AccountSettings from '../../components/Settings/AccountSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { email, username, emailUpdateForm, usernameUpdateForm } = selectors.selectCurrentUser(state);

  return {
    email,
    username,
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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
