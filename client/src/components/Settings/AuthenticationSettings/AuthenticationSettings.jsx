import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle } from '../../Utils/Button';
import UserPasswordEditPopup from '../../UserPasswordEditPopup';

import styles from './AuthenticationSettings.module.scss';

const AuthenticationSettings = React.memo(({ passwordUpdateForm, onPasswordUpdate, onPasswordUpdateMessageDismiss }) => {
  const [t] = useTranslation();

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.headerText}>{t('common.authentication')}</h2>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.action}>
          <UserPasswordEditPopup
            usePasswordConfirmation
            defaultData={passwordUpdateForm.data}
            isSubmitting={passwordUpdateForm.isSubmitting}
            error={passwordUpdateForm.error}
            onUpdate={onPasswordUpdate}
            onMessageDismiss={onPasswordUpdateMessageDismiss}
          >
            <Button style={ButtonStyle.Default} content={t('action.editPassword', { context: 'title' })} />
          </UserPasswordEditPopup>
        </div>
      </div>
    </div>
  );
});

AuthenticationSettings.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  passwordUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
};

export default AuthenticationSettings;
