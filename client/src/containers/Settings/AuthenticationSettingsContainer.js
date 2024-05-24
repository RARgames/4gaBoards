import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import selectors from '../../selectors';
import entryActions from '../../entry-actions';
import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';

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
