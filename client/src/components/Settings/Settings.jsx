import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Paths from '../../constants/Paths';
import AboutSettingsContainer from '../../containers/Settings/AboutSettingsContainer';
import AccountSettingsContainer from '../../containers/Settings/AccountSettingsContainer';
import AuthenticationSettingsContainer from '../../containers/Settings/AuthenticationSettingsContainer';
import InstanceSettingsContainer from '../../containers/Settings/InstanceSettingsContainer';
import PreferencesSettingsContainer from '../../containers/Settings/PreferencesSettingsContainer';
import ProfileSettingsContainer from '../../containers/Settings/ProfileSettingsContainer';
import ProjectSettingsContainer from '../../containers/Settings/ProjectSettingsContainer';
import UsersSettingsContainer from '../../containers/Settings/UsersSettingsContainer';

import * as s from './Settings.module.scss';

const Settings = React.memo(({ path, isAdmin, isManager }) => {
  const [t] = useTranslation();
  const mainTitle = 'LRS Boards';

  const getPageTitle = useCallback(() => {
    switch (path) {
      case Paths.SETTINGS:
        return `${t('common.settings')} | ${mainTitle}`;
      case Paths.SETTINGS_PROFILE:
        return `${t('common.settingsProfile')} | ${mainTitle}`;
      case Paths.SETTINGS_PREFERENCES:
        return `${t('common.settingsPreferences')} | ${mainTitle}`;
      case Paths.SETTINGS_ACCOUNT:
        return `${t('common.settingsAccount')} | ${mainTitle}`;
      case Paths.SETTINGS_AUTHENTICATION:
        return `${t('common.settingsAuthentication')} | ${mainTitle}`;
      case Paths.SETTINGS_ABOUT:
        return `${t('common.settingsAbout')} | ${mainTitle}`;
      case Paths.SETTINGS_INSTANCE:
        return `${t('common.settingsInstance')} | ${mainTitle}`;
      case Paths.SETTINGS_USERS:
        return `${t('common.settingsUsers')} | ${mainTitle}`;
      case Paths.SETTINGS_PROJECT:
        return `${t('common.settingsProject')} | ${mainTitle}`;
      default:
        return mainTitle;
    }
  }, [path, t]);

  useEffect(() => {
    document.title = getPageTitle();
  }, [getPageTitle, path, t]);

  switch (path) {
    case Paths.SETTINGS_PROFILE:
      return <ProfileSettingsContainer />;
    case Paths.SETTINGS_PREFERENCES:
      return <PreferencesSettingsContainer />;
    case Paths.SETTINGS_ACCOUNT:
      return <AccountSettingsContainer />;
    case Paths.SETTINGS_AUTHENTICATION:
      return <AuthenticationSettingsContainer />;
    case Paths.SETTINGS_ABOUT:
      return <AboutSettingsContainer />;
    case Paths.SETTINGS_INSTANCE:
      if (!isAdmin) {
        return <h1 className={s.text}>{t('common.cannotEditInstanceSettings')}</h1>;
      }
      return <InstanceSettingsContainer />;
    case Paths.SETTINGS_USERS:
      if (!isAdmin) {
        return <h1 className={s.text}>{t('common.cannotEditUsersSettings')}</h1>;
      }
      return <UsersSettingsContainer />;
    case Paths.SETTINGS_PROJECT:
      if (!isManager) {
        return <h1 className={s.text}>{t('common.projectNotFound', { context: 'title' })}</h1>;
      }
      return <ProjectSettingsContainer />;
    default:
      return null;
  }
});

Settings.propTypes = {
  path: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  isManager: PropTypes.bool.isRequired,
};

export default Settings;
