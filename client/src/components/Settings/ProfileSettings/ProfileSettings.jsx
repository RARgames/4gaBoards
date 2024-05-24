import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AvatarEditPopup from './AvatarEditPopup';
import User from '../../User';
import UserInformationEdit from '../../UserInformationEdit';

import styles from './ProfileSettings.module.scss';

const ProfileSettings = React.memo(({ name, avatarUrl, phone, organization, isAvatarUpdating, onUpdate, onAvatarUpdate }) => {
  const [t] = useTranslation();

  const handleAvatarDelete = useCallback(() => {
    onUpdate({
      avatarUrl: null,
    });
  }, [onUpdate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerText}>{t('common.profile')}</h2>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.avatarEdit}>
          <AvatarEditPopup defaultValue={avatarUrl} onUpdate={onAvatarUpdate} onDelete={handleAvatarDelete}>
            <User name={name} avatarUrl={avatarUrl} size="massive" isDisabled={isAvatarUpdating} />
          </AvatarEditPopup>
        </div>
        <UserInformationEdit defaultData={{ name, phone, organization }} onUpdate={onUpdate} />
      </div>
    </div>
  );
});

ProfileSettings.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  phone: PropTypes.string,
  organization: PropTypes.string,
  isAvatarUpdating: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onAvatarUpdate: PropTypes.func.isRequired,
};

ProfileSettings.defaultProps = {
  avatarUrl: undefined,
  phone: undefined,
  organization: undefined,
};

export default ProfileSettings;
