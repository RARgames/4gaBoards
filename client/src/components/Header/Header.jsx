import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import User from '../User';

import Paths from '../../constants/Paths';
import NotificationsPopup from './NotificationsPopup';
import UserPopup from '../UserPopup';

import logo from '../../assets/images/4gaboardsLogo128w-white.png';

import styles from './Header.module.scss';

const Header = React.memo(({ project, user, notifications, isLogouting, canEditProject, isAdmin, path, onProjectSettingsClick, onNotificationDelete, onLogout }) => {
  const [t] = useTranslation();
  const handleProjectSettingsClick = useCallback(() => {
    if (canEditProject) {
      onProjectSettingsClick();
    }
  }, [canEditProject, onProjectSettingsClick]);

  const getPageHeaderTitle = useCallback(() => {
    switch (path) {
      case Paths.ROOT:
        return t('common.dashboard');
      case Paths.SETTINGS:
        return t('common.settings');
      case Paths.SETTINGS_PROFILE:
        return t('common.settingsProfile');
      case Paths.SETTINGS_PREFERENCES:
        return t('common.settingsPreferences');
      case Paths.SETTINGS_ACCOUNT:
        return t('common.settingsAccount');
      case Paths.SETTINGS_AUTHENTICATION:
        return t('common.settingsAuthentication');
      case Paths.SETTINGS_ABOUT:
        return t('common.settingsAbout');
      case Paths.SETTINGS_INSTANCE:
        return t('common.settingsInstance');
      case Paths.SETTINGS_USERS:
        return t('common.settingsUsers');
      default:
        return project ? project.name : null;
    }
  }, [path, project, t]);

  return (
    <div className={styles.wrapper}>
      <Link to={Paths.ROOT} className={styles.logo}>
        <Button style={ButtonStyle.HeaderLogo} onClick={handleProjectSettingsClick} title={t('common.dashboard')}>
          <img src={logo} alt="4ga Boards" className={styles.logoIcon} />
        </Button>
      </Link>
      <div className={styles.title} title={getPageHeaderTitle()}>
        {getPageHeaderTitle()}
      </div>
      <div className={styles.menuRight}>
        {canEditProject && (
          <Button style={ButtonStyle.Header} onClick={handleProjectSettingsClick} title={t('common.projectSettings')}>
            <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
          </Button>
        )}
        <Link to={Paths.SETTINGS} className={styles.hideOnSmall}>
          <Button style={ButtonStyle.Header} title={t('common.settings')}>
            <Icon type={IconType.Settings} size={IconSize.Size18} />
          </Button>
        </Link>
        {isAdmin && (
          <Link to={Paths.SETTINGS_INSTANCE} className={styles.hideOnSmall}>
            <Button style={ButtonStyle.Header} title={t('common.settingsInstance')}>
              <Icon type={IconType.Server} size={IconSize.Size18} />
            </Button>
          </Link>
        )}
        <NotificationsPopup items={notifications} onDelete={onNotificationDelete} showCloseButton offset={10} position="bottom">
          <Button style={ButtonStyle.Header} title={t('common.notifications')}>
            <Icon type={IconType.Bell} size={IconSize.Size18} />
            {notifications.length > 0 && <span className={styles.notification}>{notifications.length}</span>}
          </Button>
        </NotificationsPopup>
        <UserPopup isAdmin={isAdmin} isLogouting={isLogouting} onLogout={onLogout} showCloseButton offset={10} position="bottom">
          <Button style={ButtonStyle.Header} title={t('common.settingsInstance')}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
          </Button>
        </UserPopup>
      </div>
    </div>
  );
});

Header.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  project: PropTypes.object,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isLogouting: PropTypes.bool.isRequired,
  canEditProject: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  onProjectSettingsClick: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  project: undefined,
};

export default Header;
