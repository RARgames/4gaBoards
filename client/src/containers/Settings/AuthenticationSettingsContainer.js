import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { isPasswordAuthenticated, passwordUpdateForm, apiClientCreateForm, apiClientUpdateForm } = selectors.selectCurrentUser(state);
  const apiClients = selectors.selectApiClientsForCurrentUser(state);
  const apiClientCount = selectors.selectApiClientCountForCurrentUser(state);

  return {
    isPasswordAuthenticated,
    passwordUpdateForm,
    apiClientCreateForm,
    apiClientUpdateForm,
    apiClients,
    apiClientCount,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onPasswordUpdate: entryActions.updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearCurrentUserPasswordUpdateError,
      onApiClientCreateMessageDismiss: entryActions.clearCurrentUserApiClientCreateError,
      onApiClientUpdateMessageDismiss: entryActions.clearCurrentUserApiClientUpdateError,
      onApiClientCreate: entryActions.createApiClient,
      onApiClientUpdate: entryActions.updateApiClient,
      onApiClientDelete: entryActions.deleteApiClient,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationSettings);
