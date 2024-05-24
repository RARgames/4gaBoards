import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import { Icon, IconType, IconSize } from '../Utils/Icon';
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
      <Link to={Paths.ROOT} className={styles.logo} title={t('common.dashboard')}>
        <img src={logo} alt="4ga Boards" className={styles.logoIcon} />
      </Link>
      <Menu inverted size="large" className={styles.menu}>
        <Menu.Menu position="left">
          <Menu.Item className={classNames(styles.item, styles.title)}>{getPageHeaderTitle()}</Menu.Item>
        </Menu.Menu>
        <Menu.Menu position="right">
          {canEditProject && (
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)} onClick={handleProjectSettingsClick} title={t('common.projectSettings')}>
              <Icon type={IconType.ProjectSettings} size={IconSize.Size18} />
            </Menu.Item>
          )}
          <Link to={Paths.SETTINGS} className={classNames(styles.itemNew, styles.itemHoverable, styles.hideOnSmall)} title={t('common.settings')}>
            <Icon type={IconType.Settings} size={IconSize.Size18} className={styles.icon} />
          </Link>
          {isAdmin && (
            <Link to={Paths.SETTINGS_INSTANCE} className={classNames(styles.itemNew, styles.itemHoverable, styles.hideOnSmall)} title={t('common.settingsInstance')}>
              <Icon type={IconType.Server} size={IconSize.Size18} className={styles.icon} />
            </Link>
          )}
          <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)} title={t('common.notifications')}>
              <Icon type={IconType.Bell} size={IconSize.Size18} />
              {notifications.length > 0 && <span className={styles.notification}>{notifications.length}</span>}
            </Menu.Item>
          </NotificationsPopup>
          <UserPopup isAdmin={isAdmin} isLogouting={isLogouting} onLogout={onLogout}>
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
              <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
            </Menu.Item>
          </UserPopup>
        </Menu.Menu>
      </Menu>
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
