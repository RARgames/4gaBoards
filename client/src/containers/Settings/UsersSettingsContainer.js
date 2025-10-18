import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import UsersSettings from '../../components/Settings/UsersSettings';
import entryActions from '../../entry-actions';
import selectors from '../../selectors';

const mapStateToProps = (state) => {
  const currentUser = selectors.selectCurrentUser(state);
  const rawUsers = selectors.selectUsers(state);
  const users = rawUsers.map(
    ({ id, name, avatarUrl, username, email, isAdmin, ssoGoogleEmail, ssoGithubUsername, ssoGithubEmail, ssoMicrosoftEmail, ssoOidcEmail, lastLogin, createdAt, createdBy, updatedAt, updatedBy }) => ({
      id,
      avatar: avatarUrl || undefined, // undefined needed for TanStack Table sorting
      name,
      username: username || undefined, // undefined needed for TanStack Table sorting
      email,
      administrator: isAdmin,
      ssoGoogleEmail: ssoGoogleEmail || undefined, // undefined needed for TanStack Table sorting
      ssoGithubUsername: ssoGithubUsername || undefined, // undefined needed for TanStack Table sorting
      ssoGithubEmail: ssoGithubEmail || undefined, // undefined needed for TanStack Table sorting
      ssoMicrosoftEmail: ssoMicrosoftEmail || undefined, // undefined needed for TanStack Table sorting
      ssoOidcEmail: ssoOidcEmail || undefined, // undefined needed for TanStack Table sorting
      lastLogin: lastLogin || undefined, // undefined needed for TanStack Table sorting
      createdAt,
      createdBy,
      updatedAt: updatedAt || undefined, // undefined needed for TanStack Table sorting
      updatedBy: updatedBy || undefined, // undefined needed for TanStack Table sorting
    }),
  );

  const { demoMode } = selectors.selectCoreSettings(state);
  const { usersSettingsStyle, usersSettingsColumnVisibility, usersSettingsFitScreen, usersSettingsItemsPerPage } = selectors.selectCurrentUserPrefs(state);

  const {
    ui: {
      userCreateForm: { data: defaultData, isSubmitting, error },
    },
  } = state;

  return {
    currentUserId: currentUser.id,
    userCreateDefaultData: defaultData,
    userCreateIsSubmitting: isSubmitting,
    userCreateError: error,
    items: users,
    demoMode,
    usersSettingsStyle,
    usersSettingsColumnVisibility,
    usersSettingsFitScreen,
    usersSettingsItemsPerPage,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUserCreate: entryActions.createUser,
      onUserCreateMessageDismiss: entryActions.clearUserCreateError,
      onUpdate: entryActions.updateUser,
      onUserPrefsUpdate: entryActions.updateCurrentUserPrefs,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UsersSettings);
