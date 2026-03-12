import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AuthenticationSettings from '../../components/Settings/AuthenticationSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const { isPasswordAuthenticated, passwordUpdateForm, apiClientForm } = selectors.selectCurrentUser(state);
  const apiClients = selectors.selectApiClientsForCurrentUser(state);
  const apiClientCount = selectors.selectApiClientCountForCurrentUser(state);

  return {
    isPasswordAuthenticated,
    passwordUpdateForm,
    apiClientForm,
    apiClients,
    apiClientCount,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onPasswordUpdate: entryActions.updateCurrentUserPassword,
      onPasswordUpdateMessageDismiss: entryActions.clearCurrentUserPasswordUpdateError,
      onApiClientMessageDismiss: entryActions.clearCurrentUserApiClientError,
      onApiClientCreate: entryActions.createApiClient,
      onApiClientUpdate: entryActions.updateApiClient,
      onApiClientDelete: entryActions.deleteApiClient,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationSettings);
