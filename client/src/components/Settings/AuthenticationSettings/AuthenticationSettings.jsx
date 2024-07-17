import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Table } from '../../Utils';
import UserPasswordEditPopup from '../../UserPasswordEditPopup';

import styles from './AuthenticationSettings.module.scss';
import sShared from '../SettingsShared.module.scss';

const AuthenticationSettings = React.memo(({ passwordUpdateForm, ssoGoogleEmail, onPasswordUpdate, onPasswordUpdateMessageDismiss, onEnableGoogleSso, onDisableGoogleSso }) => {
  const [t] = useTranslation();
  return (
    <div className={sShared.wrapper}>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>{t('common.authentication')}</h2>
      </div>
      <div className={sShared.contentWrapper}>
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
              <Button style={ButtonStyle.Default} content={t('action.editPassword', { context: 'title' })} className={styles.button} />
            </UserPasswordEditPopup>
          </div>
        </div>
      </div>
      <div className={sShared.header}>
        <h2 className={sShared.headerText}>Single Sign-on</h2>
      </div>
      <Table.Wrapper>
        <Table>
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell>Application</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.HeaderRow>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Google</Table.Cell>
              <Table.Cell>
                {ssoGoogleEmail ? (
                  <Button style={ButtonStyle.Cancel} onClick={onDisableGoogleSso}>
                    {t('action.disable')}
                  </Button>
                ) : (
                  <Button style={ButtonStyle.Submit} onClick={onEnableGoogleSso}>
                    {t('action.enable')}
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Table.Wrapper>
    </div>
  );
});

AuthenticationSettings.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  passwordUpdateForm: PropTypes.object.isRequired,
  ssoGoogleEmail: PropTypes.string.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onEnableGoogleSso: PropTypes.func.isRequired,
  onDisableGoogleSso: PropTypes.func.isRequired,
};

export default AuthenticationSettings;
