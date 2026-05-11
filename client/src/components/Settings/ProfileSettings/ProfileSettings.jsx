import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import User from '../../User';
import UserInformationEdit from '../../UserInformationEdit';
import { Icon, IconType, IconSize, Button, ButtonStyle } from '../../Utils';
import AvatarEditPopup from './AvatarEditPopup';

import * as sShared from '../SettingsShared.module.scss';
import * as s from './ProfileSettings.module.scss';

const ProfileSettings = React.memo(({ name, avatarUrl, phone, organization, isAvatarUpdating, onUpdate, onAvatarUpdate }) => {
  const [t] = useTranslation();

  const handleAvatarDelete = useCallback(() => {
    onUpdate({
      avatarUrl: null,
    });
  }, [onUpdate]);

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.profile')}</h2>
      </div>
      <div>
        <div className={s.avatarEdit}>
          <div className={s.avatarText}>{t('common.avatarText')}</div>
          <div className={s.avatarImage}>
            <AvatarEditPopup defaultValue={avatarUrl} onUpdate={onAvatarUpdate} onDelete={handleAvatarDelete} offset={-25} hideCloseButton>
              <User name={name} avatarUrl={avatarUrl} size="profile" isDisabled={isAvatarUpdating} onClick={() => {}} />
              <Button style={ButtonStyle.NoBackground} title={t('action.edit')} className={s.editButton}>
                <Icon type={IconType.Pencil} size={IconSize.Size10} className={s.iconEditButton} />
                {t('action.edit')}
              </Button>
            </AvatarEditPopup>
          </div>
        </div>
        <div className={s.actionsWrapper}>
          <div className={s.action}>
            <UserInformationEdit defaultData={{ name, phone, organization }} onUpdate={onUpdate} />
          </div>
        </div>
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
