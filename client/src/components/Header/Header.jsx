import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button, ButtonStyle, Icon, IconType, IconSize } from '../Utils';
import User from '../User';

import Paths from '../../constants/Paths';
import NotificationsPopup from './NotificationsPopup';
import UserPopup from '../UserPopup';

import logo from '../../assets/images/4gaboardsLogo128w-white.png';

import * as s from './Header.module.scss';

const Header = React.memo(({ path, project, user, notifications, isLogouting, canEditProject, isAdmin, onNotificationDelete, onLogout }) => {
  const [t] = useTranslation();

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
      case Paths.SETTINGS_PROJECT:
        return t('common.settingsProject');
      default:
        return project ? project.name : null;
    }
  }, [path, project, t]);

  return (
    <div className={s.wrapper}>
      <Link to={Paths.ROOT} className={s.logo}>
        <Button style={ButtonStyle.HeaderLogo} title={t('common.dashboard')}>
          <img src={logo} alt="4ga Boards" className={s.logoIcon} />
        </Button>
      </Link>
      <div className={s.title} title={getPageHeaderTitle()}>
        {getPageHeaderTitle()}
      </div>
      <div className={s.menuRight}>
        <Link to={Paths.SETTINGS} className={s.hideOnSmall}>
          <Button style={ButtonStyle.Header} title={t('common.settings')}>
            <Icon type={IconType.Settings} size={IconSize.Size18} />
          </Button>
        </Link>
        {isAdmin && (
          <Link to={Paths.SETTINGS_USERS} className={s.hideOnSmall}>
            <Button style={ButtonStyle.Header} title={t('common.settingsUsers')}>
              <Icon type={IconType.Users} size={IconSize.Size18} />
            </Button>
          </Link>
        )}
        <NotificationsPopup items={notifications} onDelete={onNotificationDelete}>
          <Button style={ButtonStyle.Header} title={t('common.notifications')}>
            <Icon type={IconType.Bell} size={IconSize.Size18} />
            {notifications.length > 0 && <span className={s.notification}>{notifications.length}</span>}
          </Button>
        </NotificationsPopup>
        <UserPopup canEditProject={canEditProject} projectId={project?.id} isAdmin={isAdmin} isLogouting={isLogouting} onLogout={onLogout}>
          <Button style={ButtonStyle.Header} title={t('common.profileAndSettings')}>
            <User name={user.name} avatarUrl={user.avatarUrl} size="card" skipTitle />
          </Button>
        </UserPopup>
      </div>
    </div>
  );
});

Header.propTypes = {
  path: PropTypes.string,
  /* eslint-disable react/forbid-prop-types */
  project: PropTypes.object,
  user: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  /* eslint-enable react/forbid-prop-types */
  isLogouting: PropTypes.bool.isRequired,
  canEditProject: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  path: undefined,
  project: undefined,
};

export default Header;
