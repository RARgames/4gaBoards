import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../selectors';
import entryActions from '../entry-actions';
import UsersModal from '../components/UsersModal';

const mapStateToProps = (state) => {
  const users = selectors.selectUsersExceptCurrent(state);
  const coreSettings = selectors.selectCoreSettings(state);

  return {
    items: users,
    ssoRegistrationEnabled: coreSettings.ssoRegistrationEnabled,
    registrationEnabled: coreSettings.registrationEnabled,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCoreSettingsUpdate: entryActions.updateCoreSettings,
      onUpdate: entryActions.updateUser,
      onUsernameUpdate: entryActions.updateUserUsername,
      onUsernameUpdateMessageDismiss: entryActions.clearUserUsernameUpdateError,
      onEmailUpdate: entryActions.updateUserEmail,
      onEmailUpdateMessageDismiss: entryActions.clearUserEmailUpdateError,
      onPasswordUpdate: entryActions.updateUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearUserPasswordUpdateError,
      onDelete: entryActions.deleteUser,
      onClose: entryActions.closeModal,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersModal);
