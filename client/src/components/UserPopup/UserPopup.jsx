import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';
import Paths from '../../constants/Paths';

import * as styles from './UserPopup.module.scss';

const UserStep = React.memo(({ canEditProject, projectId, isAdmin, isLogouting, onLogout, onClose }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (path) => {
      navigate(path);
      onClose();
    },
    [navigate, onClose],
  );

  return (
    <>
      <Button style={ButtonStyle.PopupContext} title={t('common.profile')} onClick={() => handleClick(Paths.SETTINGS_PROFILE)}>
        <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
        {t('common.profile')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.preferences')} onClick={() => handleClick(Paths.SETTINGS_PREFERENCES)}>
        <Icon type={IconType.Sliders} size={IconSize.Size14} className={styles.icon} />
        {t('common.preferences')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.account')} onClick={() => handleClick(Paths.SETTINGS_ACCOUNT)}>
        <Icon type={IconType.AddressCard} size={IconSize.Size14} className={styles.icon} />
        {t('common.account')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.authentication')} onClick={() => handleClick(Paths.SETTINGS_AUTHENTICATION)}>
        <Icon type={IconType.Key} size={IconSize.Size14} className={styles.icon} />
        {t('common.authentication')}
      </Button>
      <Button style={ButtonStyle.PopupContext} title={t('common.aboutShort')} onClick={() => handleClick(Paths.SETTINGS_ABOUT)}>
        <Icon type={IconType.Info} size={IconSize.Size14} className={styles.icon} />
        {t('common.aboutShort')}
      </Button>
      {isAdmin && (
        <Button style={ButtonStyle.PopupContext} title={t('common.instanceSettings')} onClick={() => handleClick(Paths.SETTINGS_INSTANCE)}>
          <Icon type={IconType.Server} size={IconSize.Size14} className={styles.icon} />
          {t('common.instanceSettings')}
        </Button>
      )}
      {isAdmin && (
        <Button style={ButtonStyle.PopupContext} title={t('common.users')} onClick={() => handleClick(Paths.SETTINGS_USERS)}>
          <Icon type={IconType.Users} size={IconSize.Size14} className={styles.icon} />
          {t('common.users')}
        </Button>
      )}
      {canEditProject && projectId && (
        <Button style={ButtonStyle.PopupContext} title={t('common.projectSettings')} onClick={() => handleClick(Paths.SETTINGS_PROJECT)}>
          <Icon type={IconType.ProjectSettings} size={IconSize.Size14} className={styles.icon} />
          {t('common.projectSettings')}
        </Button>
      )}
      <Popup.Separator />
      <Button style={ButtonStyle.PopupContext} content={t('action.logOut', { context: 'title' })} onClick={onLogout} disabled={isLogouting} />
    </>
  );
});

UserStep.propTypes = {
  canEditProject: PropTypes.bool.isRequired,
  projectId: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  isLogouting: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserStep.defaultProps = {
  projectId: undefined,
};

export default withPopup(UserStep);
