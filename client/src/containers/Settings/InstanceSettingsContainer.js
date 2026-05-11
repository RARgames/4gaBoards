import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InstanceSettings from '../../components/Settings/InstanceSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const {
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    projectCreationAllEnabled,
    syncSsoDataOnAuth,
    syncSsoAdminOnAuth,
    allowedRegisterDomains,
    demoMode,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
  } = selectors.selectCoreSettings(state);
  const activities = selectors.selectInstanceActivities(state);

  return {
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    projectCreationAllEnabled,
    syncSsoDataOnAuth,
    syncSsoAdminOnAuth,
    demoMode,
    allowedRegisterDomains,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    activities,
    isActivitiesFetching,
    isAllActivitiesFetched,
    lastActivityId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onCoreSettingsUpdate: entryActions.updateCoreSettings,
      onActivitiesFetch: entryActions.fetchInstanceActivities,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InstanceSettings);
