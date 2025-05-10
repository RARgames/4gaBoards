import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { isPasswordAuthenticated, passwordUpdateForm } = selectors.selectCurrentUser(state);

  return {
    isPasswordAuthenticated,
    passwordUpdateForm,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onPasswordUpdate: entryActions.updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearCurrentUserPasswordUpdateError,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationSettings);
