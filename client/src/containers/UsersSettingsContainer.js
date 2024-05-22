import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import UsersSettings from '../components/Settings/UsersSettings';

const mapStateToProps = (state) => {
  const users = selectors.selectUsersExceptCurrent(state);

  return {
    items: users,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdate: entryActions.updateUser,
      onUsernameUpdate: entryActions.updateUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearUserEmailUpdateError,
      onPasswordUpdate: entryActions.updateUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearUserPasswordUpdateError,
      onDelete: entryActions.deleteUser,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersSettings);
