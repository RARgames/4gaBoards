import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import logo from '../../assets/images/4gaLogo512w.png';
import Paths from '../../constants/Paths';
import User from '../User';
import UserPopup from '../UserPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, ExternalLink } from '../Utils';
import NotificationsPopup from './NotificationsPopup';

import * as s from './Header.module.scss';

const Header = React.memo(
  ({
    path,
    project,
    user,
    notifications,
    notificationCount,
    isLogouting,
    canEditProject,
    isAdmin,
    demoMode,
    onNotificationUpdate,
    onNotificationMarkAllAs,
    onNotificationDelete,
    onNotificationDeleteAll,
    onLogout,
  }) => {
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
        {demoMode && (
          <div className={s.demoMode}>
            <ExternalLink href="https://github.com/RARgames/4gaBoards" className={clsx(s.demoModeNotice, s.hideOnSmallGithub)}>
              <Icon type={IconType.GitHub} size={IconSize.Size20} />
              <div className={s.demoModeNoticeTexts}>
                <span className={s.demoModeNoticeTextMain}>{t('common.demoModeGithubMain')}</span>
                <span className={s.demoModeNoticeTextExtra}>{t('common.demoModeGithubExtra')}</span>
              </div>
            </ExternalLink>
            <div className={clsx(s.demoModeNoticeSeparator, s.hideOnSmallFeedback)} />
            <ExternalLink href="https://forms.gle/FqjR7uhBp9Gn2fu26" className={clsx(s.demoModeNotice, s.hideOnSmallFeedback)}>
              <Icon type={IconType.StarHalf} size={IconSize.Size20} />
              <div className={s.demoModeNoticeTexts}>
                <span className={s.demoModeNoticeTextMain}>{t('common.feedbackMain')}</span>
                <span className={s.demoModeNoticeTextExtra}>{t('common.feedbackExtra')}</span>
              </div>
            </ExternalLink>
          </div>
        )}
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
          <NotificationsPopup items={notifications} onUpdate={onNotificationUpdate} onMarkAllAs={onNotificationMarkAllAs} onDelete={onNotificationDelete} onDeleteAll={onNotificationDeleteAll} hideCloseButton>
            <Button style={ButtonStyle.Header} title={t('common.notifications')}>
              <Icon type={IconType.Bell} size={IconSize.Size18} />
              {notificationCount > 0 && <span className={s.notification}>{notificationCount}</span>}
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
  },
);

Header.propTypes = {
  path: PropTypes.string,
  project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  notifications: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  notificationCount: PropTypes.number.isRequired,
  isLogouting: PropTypes.bool.isRequired,
  canEditProject: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  demoMode: PropTypes.bool.isRequired,
  onNotificationUpdate: PropTypes.func.isRequired,
  onNotificationMarkAllAs: PropTypes.func.isRequired,
  onNotificationDelete: PropTypes.func.isRequired,
  onNotificationDeleteAll: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

Header.defaultProps = {
  path: undefined,
  project: undefined,
};

export default Header;
