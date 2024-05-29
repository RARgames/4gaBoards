import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, ButtonStyle, Icon, IconType, IconSize, Popup, withPopup } from '../Utils';
import Paths from '../../constants/Paths';

import styles from './UserPopup.module.scss';

const UserStep = React.memo(({ isAdmin, isLogouting, onLogout, onClose }) => {
  const [t] = useTranslation();

  return (
    <>
      <Link to={Paths.SETTINGS_PROFILE} onClick={onClose}>
        <Button style={ButtonStyle.Popup} title={t('common.profile')}>
          <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
          {t('common.profile')}
        </Button>
      </Link>
      <Link to={Paths.SETTINGS_PREFERENCES} onClick={onClose}>
        <Button style={ButtonStyle.Popup} title={t('common.preferences')}>
          <Icon type={IconType.Sliders} size={IconSize.Size14} className={styles.icon} />
          {t('common.preferences')}
        </Button>
      </Link>
      <Link to={Paths.SETTINGS_ACCOUNT} onClick={onClose}>
        <Button style={ButtonStyle.Popup} title={t('common.account')}>
          <Icon type={IconType.AddressCard} size={IconSize.Size14} className={styles.icon} />
          {t('common.account')}
        </Button>
      </Link>
      <Link to={Paths.SETTINGS_AUTHENTICATION} onClick={onClose}>
        <Button style={ButtonStyle.Popup} title={t('common.authentication')}>
          <Icon type={IconType.Key} size={IconSize.Size14} className={styles.icon} />
          {t('common.authentication')}
        </Button>
      </Link>
      <Link to={Paths.SETTINGS_ABOUT} onClick={onClose}>
        <Button style={ButtonStyle.Popup} title={t('common.aboutShort')}>
          <Icon type={IconType.Info} size={IconSize.Size14} className={styles.icon} />
          {t('common.aboutShort')}
        </Button>
      </Link>
      {isAdmin && (
        <Link to={Paths.SETTINGS_INSTANCE} onClick={onClose}>
          <Button style={ButtonStyle.Popup} title={t('common.settingsInstance')}>
            <Icon type={IconType.Server} size={IconSize.Size14} className={styles.icon} />
            {t('common.settingsInstance')}
          </Button>
        </Link>
      )}
      {isAdmin && (
        <Link to={Paths.SETTINGS_USERS} onClick={onClose}>
          <Button style={ButtonStyle.Popup} title={t('common.users')}>
            <Icon type={IconType.Users} size={IconSize.Size14} className={styles.icon} />
            {t('common.users')}
          </Button>
        </Link>
      )}
      <Popup.Separator />
      <Button style={ButtonStyle.Popup} content={t('action.logOut', { context: 'title' })} onClick={onLogout} disabled={isLogouting} />
    </>
  );
});

UserStep.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isLogouting: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(UserStep);
