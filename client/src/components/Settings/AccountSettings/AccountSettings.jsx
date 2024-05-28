import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle } from '../../Utils';
import UserUsernameEditPopup from '../../UserUsernameEditPopup';
import UserEmailEditPopup from '../../UserEmailEditPopup';

import styles from './AccountSettings.module.scss';
import sShared from '../SettingsShared.module.scss';

const AccountSettings = React.memo(({ email, username, usernameUpdateForm, emailUpdateForm, onUsernameUpdate, onUsernameUpdateMessageDismiss, onEmailUpdate, onEmailUpdateMessageDismiss }) => {
  const [t] = useTranslation();

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.account')}</h2>
      </div>
      <div className={sShared.contentWrapper}>
        <div className={styles.actionsWrapper}>
          <div className={styles.action}>
            <UserUsernameEditPopup
              usePasswordConfirmation
              defaultData={usernameUpdateForm.data}
              username={username}
              isSubmitting={usernameUpdateForm.isSubmitting}
              error={usernameUpdateForm.error}
              onUpdate={onUsernameUpdate}
              onMessageDismiss={onUsernameUpdateMessageDismiss}
              position="bottom-start"
            >
              <Button style={ButtonStyle.Default} content={t('action.editUsername', { context: 'title' })} className={styles.button} />
            </UserUsernameEditPopup>
          </div>
          <div className={styles.action}>
            <UserEmailEditPopup
              usePasswordConfirmation
              defaultData={emailUpdateForm.data}
              email={email}
              isSubmitting={emailUpdateForm.isSubmitting}
              error={emailUpdateForm.error}
              onUpdate={onEmailUpdate}
              onMessageDismiss={onEmailUpdateMessageDismiss}
              position="bottom-start"
            >
              <Button style={ButtonStyle.Default} content={t('action.editEmail', { context: 'title' })} className={styles.button} />
            </UserEmailEditPopup>
          </div>
        </div>
      </div>
    </div>
  );
});

AccountSettings.propTypes = {
  email: PropTypes.string.isRequired,
  username: PropTypes.string,
  /* eslint-disable react/forbid-prop-types */
  usernameUpdateForm: PropTypes.object.isRequired,
  emailUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
};

AccountSettings.defaultProps = {
  username: undefined,
};

export default AccountSettings;
