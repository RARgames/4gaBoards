import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, Table, Radio } from 'semantic-ui-react';
import { ButtonTmp, ButtonStyle } from '../Utils/Button';

import UserAddPopupContainer from '../../containers/UserAddPopupContainer';
import Item from './Item';

import styles from './UsersModal.module.scss';

const UsersModal = React.memo(
  ({
    items,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    onCoreSettingsUpdate,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete,
    onClose,
  }) => {
    const [t] = useTranslation();

    const handleUpdate = useCallback(
      (id, data) => {
        onUpdate(id, data);
      },
      [onUpdate],
    );

    const handleUsernameUpdate = useCallback(
      (id, data) => {
        onUsernameUpdate(id, data);
      },
      [onUsernameUpdate],
    );

    const handleUsernameUpdateMessageDismiss = useCallback(
      (id) => {
        onUsernameUpdateMessageDismiss(id);
      },
      [onUsernameUpdateMessageDismiss],
    );

    const handleEmailUpdate = useCallback(
      (id, data) => {
        onEmailUpdate(id, data);
      },
      [onEmailUpdate],
    );

    const handleEmailUpdateMessageDismiss = useCallback(
      (id) => {
        onEmailUpdateMessageDismiss(id);
      },
      [onEmailUpdateMessageDismiss],
    );

    const handlePasswordUpdate = useCallback(
      (id, data) => {
        onPasswordUpdate(id, data);
      },
      [onPasswordUpdate],
    );

    const handlePasswordUpdateMessageDismiss = useCallback(
      (id) => {
        onPasswordUpdateMessageDismiss(id);
      },
      [onPasswordUpdateMessageDismiss],
    );

    const handleDelete = useCallback(
      (id) => {
        onDelete(id);
      },
      [onDelete],
    );

    const handleRegistrationEnabledChange = useCallback(() => {
      onCoreSettingsUpdate({
        registrationEnabled: !registrationEnabled,
      });
    }, [onCoreSettingsUpdate, registrationEnabled]);

    const handleLocalRegistrationEnabledChange = useCallback(() => {
      onCoreSettingsUpdate({
        localRegistrationEnabled: !localRegistrationEnabled,
      });
    }, [localRegistrationEnabled, onCoreSettingsUpdate]);

    const handleSsoRegistrationEnabledChange = useCallback(() => {
      onCoreSettingsUpdate({
        ssoRegistrationEnabled: !ssoRegistrationEnabled,
      });
    }, [onCoreSettingsUpdate, ssoRegistrationEnabled]);

    return (
      <Modal open closeIcon size="large" centered={false} onClose={onClose}>
        <Modal.Header>{t('common.users', { context: 'title' })}</Modal.Header>
        <Modal.Content scrolling>
          <Table unstackable basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell width={3}>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell width={3}>{t('common.username')}</Table.HeaderCell>
                <Table.HeaderCell width={4}>{t('common.email')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.administrator')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.ssoGoogleEmail')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.lastLogin')}</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map((item) => (
                <Item
                  key={item.id}
                  email={item.email}
                  username={item.username}
                  name={item.name}
                  avatarUrl={item.avatarUrl}
                  organization={item.organization}
                  phone={item.phone}
                  ssoGoogleEmail={item.ssoGoogleEmail}
                  lastLogin={item.lastLogin}
                  isAdmin={item.isAdmin}
                  emailUpdateForm={item.emailUpdateForm}
                  passwordUpdateForm={item.passwordUpdateForm}
                  usernameUpdateForm={item.usernameUpdateForm}
                  onUpdate={(data) => handleUpdate(item.id, data)}
                  onUsernameUpdate={(data) => handleUsernameUpdate(item.id, data)}
                  onUsernameUpdateMessageDismiss={() => handleUsernameUpdateMessageDismiss(item.id)}
                  onEmailUpdate={(data) => handleEmailUpdate(item.id, data)}
                  onEmailUpdateMessageDismiss={() => handleEmailUpdateMessageDismiss(item.id)}
                  onPasswordUpdate={(data) => handlePasswordUpdate(item.id, data)}
                  onPasswordUpdateMessageDismiss={() => handlePasswordUpdateMessageDismiss(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions className={styles.actions}>
          <div className={styles.settings}>
            <span>
              {t('common.enableRegistration')}
              <Radio toggle checked={registrationEnabled} onChange={handleRegistrationEnabledChange} className={styles.radio} />
            </span>
            <span>
              {t('common.enableLocalRegistration')}
              <Radio toggle checked={registrationEnabled && localRegistrationEnabled} disabled={!registrationEnabled} onChange={handleLocalRegistrationEnabledChange} className={styles.radio} />
            </span>
            <span>
              {t('common.enableSsoRegistration')}
              <Radio toggle checked={registrationEnabled && ssoRegistrationEnabled} disabled={!registrationEnabled} onChange={handleSsoRegistrationEnabledChange} className={styles.radio} />
            </span>
          </div>
          <UserAddPopupContainer>
            <ButtonTmp style={ButtonStyle.Submit} content={t('action.addUser')} />
          </UserAddPopupContainer>
        </Modal.Actions>
      </Modal>
    );
  },
);

UsersModal.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  onCoreSettingsUpdate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UsersModal;
