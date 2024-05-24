import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { withPopup } from '../../lib/popup';
import { Popup } from '../../lib/custom-ui';
import { Icon, IconType, IconSize } from '../Utils/Icon';
import Paths from '../../constants/Paths';

import styles from './UserPopup.module.scss';

const UserStep = React.memo(({ isAdmin, isLogouting, onLogout, onClose }) => {
  const [t] = useTranslation();

  let logoutMenuItemProps;
  if (isLogouting) {
    logoutMenuItemProps = {
      as: Button,
      fluid: true,
      basic: true,
      loading: true,
      disabled: true,
    };
  }

  return (
    <>
      <Popup.Header>{t('common.userActions', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        <Menu secondary vertical className={styles.menu}>
          <Link to={Paths.SETTINGS_PROFILE} className={styles.item} title={t('common.profile')} onClick={onClose}>
            <Icon type={IconType.User} size={IconSize.Size14} className={styles.icon} />
            {t('common.profile')}
          </Link>
          <Link to={Paths.SETTINGS_PREFERENCES} className={styles.item} title={t('common.preferences')} onClick={onClose}>
            <Icon type={IconType.Sliders} size={IconSize.Size14} className={styles.icon} />
            {t('common.preferences')}
          </Link>
          <Link to={Paths.SETTINGS_ACCOUNT} className={styles.item} title={t('common.account')} onClick={onClose}>
            <Icon type={IconType.AddressCard} size={IconSize.Size14} className={styles.icon} />
            {t('common.account')}
          </Link>
          <Link to={Paths.SETTINGS_AUTHENTICATION} className={styles.item} title={t('common.authentication')} onClick={onClose}>
            <Icon type={IconType.Key} size={IconSize.Size14} className={styles.icon} />
            {t('common.authentication')}
          </Link>
          <Link to={Paths.SETTINGS_ABOUT} className={styles.item} title={t('common.aboutShort')} onClick={onClose}>
            <Icon type={IconType.Info} size={IconSize.Size14} className={styles.icon} />
            {t('common.aboutShort')}
          </Link>
          {isAdmin && (
            <Link to={Paths.SETTINGS_INSTANCE} className={styles.item} title={t('common.settingsInstance')} onClick={onClose}>
              <Icon type={IconType.Server} size={IconSize.Size14} className={styles.icon} />
              {t('common.settingsInstance')}
            </Link>
          )}
          {isAdmin && (
            <Link to={Paths.SETTINGS_USERS} className={styles.item} title={t('common.users')} onClick={onClose}>
              <Icon type={IconType.Users} size={IconSize.Size14} className={styles.icon} />
              {t('common.users')}
            </Link>
          )}
          <Menu.Item
            {...logoutMenuItemProps} // eslint-disable-line react/jsx-props-no-spreading
            className={styles.menuItem}
            onClick={onLogout}
          >
            {t('action.logOut', { context: 'title' })}
          </Menu.Item>
        </Menu>
      </Popup.Content>
    </>
  );
});

UserStep.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  isLogouting: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withPopup(UserStep, {
  position: 'bottom right',
});
