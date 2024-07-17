import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';

const mapStateToProps = (state) => {
  const { passwordUpdateForm, ssoGoogleEmail } = selectors.selectCurrentUser(state);

  return {
    passwordUpdateForm,
    ssoGoogleEmail,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onPasswordUpdate: entryActions.updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearCurrentUserPasswordUpdateError,
      onEnableGoogleSso: entryActions.enableCurrentUserGoogleSso,
      onDisableGoogleSso: entryActions.disableCurrentUserGoogleSso,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationSettings);
