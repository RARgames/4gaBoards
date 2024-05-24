import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Icon, IconType, IconSize } from '../Utils/Icon';
import { Button, ButtonStyle } from '../Utils/Button';

import ProfileSettingsContainer from '../../containers/Settings/ProfileSettingsContainer';
import PreferencesSettingsContainer from '../../containers/Settings/PreferencesSettingsContainer';
import AccountSettingsContainer from '../../containers/Settings/AccountSettingsContainer';
import AuthenticationSettingsContainer from '../../containers/Settings/AuthenticationSettingsContainer';
import AboutSettingsContainer from '../../containers/Settings/AboutSettingsContainer';
import UsersSettingsContainer from '../../containers/Settings/UsersSettingsContainer';
import InstanceSettingsContainer from '../../containers/Settings/InstanceSettingsContainer';
import Paths from '../../constants/Paths';

import styles from './Settings.module.scss';

const Settings = React.memo(({ path, isAdmin }) => {
  const [t] = useTranslation();
  const mainTitle = '4ga Boards';

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
      default:
        return mainTitle;
    }
  }, [path, t]);

  useEffect(() => {
    document.title = getPageTitle();
  }, [getPageTitle, path, t]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>
          <Icon type={IconType.Settings} size={IconSize.Size20} className={styles.sidebarTitleIcon} />
          {t('common.settings')}
        </div>
        <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_PROFILE && styles.sidebarActive)}>
          <Link to={Paths.SETTINGS_PROFILE}>
            <Button style={ButtonStyle.NoBackground} title={t('common.profile')} className={styles.sidebarButton}>
              <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
              {t('common.profile')}
            </Button>
          </Link>
        </div>
        <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_PREFERENCES && styles.sidebarActive)}>
          <Link to={Paths.SETTINGS_PREFERENCES}>
            <Button style={ButtonStyle.NoBackground} title={t('common.preferences')} className={styles.sidebarButton}>
              <Icon type={IconType.Sliders} size={IconSize.Size14} className={styles.icon} />
              {t('common.preferences')}
            </Button>
          </Link>
        </div>
        <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_ACCOUNT && styles.sidebarActive)}>
          <Link to={Paths.SETTINGS_ACCOUNT}>
            <Button style={ButtonStyle.NoBackground} title={t('common.account')} className={styles.sidebarButton}>
              <Icon type={IconType.AddressCard} size={IconSize.Size14} className={styles.icon} />
              {t('common.account')}
            </Button>
          </Link>
        </div>
        <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_AUTHENTICATION && styles.sidebarActive)}>
          <Link to={Paths.SETTINGS_AUTHENTICATION}>
            <Button style={ButtonStyle.NoBackground} title={t('common.authentication')} className={styles.sidebarButton}>
              <Icon type={IconType.Key} size={IconSize.Size14} className={styles.icon} />
              {t('common.authentication')}
            </Button>
          </Link>
        </div>
        <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_ABOUT && styles.sidebarActive)}>
          <Link to={Paths.SETTINGS_ABOUT}>
            <Button style={ButtonStyle.NoBackground} title={t('common.aboutShort')} className={styles.sidebarButton}>
              <Icon type={IconType.Info} size={IconSize.Size14} className={styles.icon} />
              {t('common.aboutShort')}
            </Button>
          </Link>
        </div>
        {isAdmin && (
          <div>
            <div className={styles.sidebarTitle}>
              <Icon type={IconType.Server} size={IconSize.Size20} className={styles.sidebarTitleIcon} />
              {t('common.settingsInstance')}
            </div>
            <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_INSTANCE && styles.sidebarActive)}>
              <Link to={Paths.SETTINGS_INSTANCE}>
                <Button style={ButtonStyle.NoBackground} title={t('common.settings')} className={styles.sidebarButton}>
                  <Icon type={IconType.Settings} size={IconSize.Size14} className={styles.icon} />
                  {t('common.settings')}
                </Button>
              </Link>
            </div>
            <div className={classNames(styles.sidebarItem, path === Paths.SETTINGS_USERS && styles.sidebarActive)}>
              <Link to={Paths.SETTINGS_USERS}>
                <Button style={ButtonStyle.NoBackground} title={t('common.users')} className={styles.sidebarButton}>
                  <Icon type={IconType.Users} size={IconSize.Size14} className={styles.icon} />
                  {t('common.users')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className={styles.content}>
        {path === Paths.SETTINGS_PROFILE && <ProfileSettingsContainer />}
        {path === Paths.SETTINGS_PREFERENCES && <PreferencesSettingsContainer />}
        {path === Paths.SETTINGS_ACCOUNT && <AccountSettingsContainer />}
        {path === Paths.SETTINGS_AUTHENTICATION && <AuthenticationSettingsContainer />}
        {path === Paths.SETTINGS_ABOUT && <AboutSettingsContainer />}
        {path === Paths.SETTINGS_INSTANCE && isAdmin && <InstanceSettingsContainer />}
        {path === Paths.SETTINGS_INSTANCE && !isAdmin && <h1 className={styles.text}>{t('common.cannotEditInstanceSettings')}</h1>}
        {path === Paths.SETTINGS_USERS && isAdmin && <UsersSettingsContainer />}
        {path === Paths.SETTINGS_USERS && !isAdmin && <h1 className={styles.text}>{t('common.cannotEditUsersSettings')}</h1>}
      </div>
    </div>
  );
});

Settings.propTypes = {
  path: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default Settings;
