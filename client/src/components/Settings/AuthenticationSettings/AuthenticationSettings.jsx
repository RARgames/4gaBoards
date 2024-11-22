import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle } from '../../Utils';
import UserPasswordEditPopup from '../../UserPasswordEditPopup';

import * as styles from './AuthenticationSettings.module.scss';
import * as sShared from '../SettingsShared.module.scss';

const AuthenticationSettings = React.memo(({ passwordUpdateForm, onPasswordUpdate, onPasswordUpdateMessageDismiss }) => {
  const [t] = useTranslation();

  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.authentication')}</h2>
      </div>
      <div>
        <div className={styles.actionsWrapper}>
          <div className={styles.action}>
            <UserPasswordEditPopup
              usePasswordConfirmation
              defaultData={passwordUpdateForm.data}
              isSubmitting={passwordUpdateForm.isSubmitting}
              error={passwordUpdateForm.error}
              onUpdate={onPasswordUpdate}
              onMessageDismiss={onPasswordUpdateMessageDismiss}
            >
              <Button style={ButtonStyle.DefaultBorder} content={t('action.editPassword', { context: 'title' })} />
            </UserPasswordEditPopup>
          </div>
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
