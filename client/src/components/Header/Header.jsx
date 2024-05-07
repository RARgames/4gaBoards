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

const Header = React.memo(({ project, user, notifications, isLogouting, canEditProject, canEditUsers, onProjectSettingsClick, onUsersClick, onNotificationDelete, onUserSettingsClick, onLogout }) => {
  const [t] = useTranslation();
  const handleProjectSettingsClick = useCallback(() => {
    if (canEditProject) {
      onProjectSettingsClick();
    }
  }, [canEditProject, onProjectSettingsClick]);

  return (
    <div className={styles.wrapper}>
      {!project && (
        <Link to={Paths.ROOT} className={classNames(styles.logo, styles.title)}>
          <img src={logo} alt="4ga Boards" className={styles.logoIcon} />
        </Link>
      )}
      <Menu inverted size="large" className={styles.menu}>
        {project && (
          <Menu.Menu position="left">
            <Menu.Item as={Link} to={Paths.ROOT} className={classNames(styles.item, styles.itemHoverable)}>
              <Icon type={IconType.ArrowDown} size={IconSize.Size18} title={t('common.projects')} className={styles.projectsButton} />
            </Menu.Item>
            <Menu.Item className={classNames(styles.item, styles.title)}>{project.name}</Menu.Item>
          </Menu.Menu>
        )}
        <Menu.Menu position="right">
          {canEditProject && (
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)} onClick={handleProjectSettingsClick}>
              <Icon type={IconType.Settings} size={IconSize.Size18} title={t('common.projectSettings')} />
            </Menu.Item>
          )}
          {canEditUsers && (
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)} onClick={onUsersClick}>
              <Icon type={IconType.Users} size={IconSize.Size18} title={t('common.users')} />
            </Menu.Item>
          )}
          <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
            <Menu.Item className={classNames(styles.item, styles.itemHoverable)}>
              <Icon type={IconType.Bell} size={IconSize.Size18} title={t('common.notifications')} />
              {notifications.length > 0 && <span className={styles.notification}>{notifications.length}</span>}
            </Menu.Item>
          </NotificationsPopup>
          <UserPopup isLogouting={isLogouting} onSettingsClick={onUserSettingsClick} onLogout={onLogout}>
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
  canEditUsers: PropTypes.bool.isRequired,
  onProjectSettingsClick: PropTypes.func.isRequired,
  onUsersClick: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onUserSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  project: undefined,
};

export default Header;
