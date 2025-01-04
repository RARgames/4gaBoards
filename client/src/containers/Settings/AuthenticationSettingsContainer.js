import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { passwordUpdateForm } = selectors.selectCurrentUser(state);

  return {
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
