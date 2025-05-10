import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import UserEmailEditPopup from '../../UserEmailEditPopup';
import UserUsernameEditPopup from '../../UserUsernameEditPopup';
import { Button, ButtonStyle } from '../../Utils';

import * as sShared from '../SettingsShared.module.scss';
import * as s from './AccountSettings.module.scss';

const AccountSettings = React.memo(
  ({ email, username, isPasswordAuthenticated, usernameUpdateForm, emailUpdateForm, onUsernameUpdate, onUsernameUpdateMessageDismiss, onEmailUpdate, onEmailUpdateMessageDismiss }) => {
    const [t] = useTranslation();

    return (
      <div className={sShared.wrapper}>
        <div className={sShared.header}>
          <h2 className={sShared.headerText}>{t('common.account')}</h2>
        </div>
        <div>
          <div className={s.actionsWrapper}>
            <div className={s.action}>
              <UserUsernameEditPopup
                usePasswordConfirmation={isPasswordAuthenticated}
                defaultData={usernameUpdateForm.data}
                username={username}
                isSubmitting={usernameUpdateForm.isSubmitting}
                error={usernameUpdateForm.error}
                onUpdate={onUsernameUpdate}
                onMessageDismiss={onUsernameUpdateMessageDismiss}
              >
                <Button style={ButtonStyle.DefaultBorder} content={t('action.editUsername', { context: 'title' })} />
              </UserUsernameEditPopup>
            </div>
            <div className={s.action}>
              <UserEmailEditPopup
                usePasswordConfirmation={isPasswordAuthenticated}
                defaultData={emailUpdateForm.data}
                email={email}
                isSubmitting={emailUpdateForm.isSubmitting}
                error={emailUpdateForm.error}
                onUpdate={onEmailUpdate}
                onMessageDismiss={onEmailUpdateMessageDismiss}
              >
                <Button style={ButtonStyle.DefaultBorder} content={t('action.editEmail', { context: 'title' })} />
              </UserEmailEditPopup>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AccountSettings.propTypes = {
  email: PropTypes.string.isRequired,
  username: PropTypes.string,
  isPasswordAuthenticated: PropTypes.bool.isRequired,
  usernameUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  emailUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
};

AccountSettings.defaultProps = {
  username: undefined,
};

export default AccountSettings;
