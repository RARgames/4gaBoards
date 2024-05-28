import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../../Utils/Button';
import Table from '../../Utils/Table';

import UserAddPopup from '../../UserAddPopup';
import Item from './Item';

import styles from './UsersSettings.module.scss';
import sShared from '../SettingsShared.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const UsersSettings = React.memo(
  ({
    userCreateDefaultData,
    userCreateIsSubmitting,
    userCreateError,
    items,
    onUserCreate,
    onUserCreateMessageDismiss,
    onUpdate,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onPasswordUpdate,
    onPasswordUpdateMessageDismiss,
    onDelete,
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

    // TODO scroll is too long - overlaping header
    return (
      <div className={sShared.wrapper}>
        <div className={sShared.header}>
          <h2 className={sShared.headerText}>{t('common.users')}</h2>
          <div className={styles.headerButton}>
            <UserAddPopup
              defaultData={userCreateDefaultData}
              isSubmitting={userCreateIsSubmitting}
              error={userCreateError}
              onCreate={onUserCreate}
              onMessageDismiss={onUserCreateMessageDismiss}
              position="left-start"
            >
              <Button style={ButtonStyle.Submit} content={t('action.addUser')} />
            </UserAddPopup>
          </div>
        </div>
        <Table.Wrapper className={classNames(sShared.contentWrapper, gStyles.scrollableXY)}>
          <Table>
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeaderCell aria-label={t('common.avatar')} />
                <Table.HeaderCell>{t('common.name')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.username')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.email')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.administrator')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.ssoGoogleEmail')}</Table.HeaderCell>
                <Table.HeaderCell>{t('common.lastLogin')}</Table.HeaderCell>
                <Table.HeaderCell aria-label={t('common.editUser')} />
              </Table.HeaderRow>
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
        </Table.Wrapper>
      </div>
    );
  },
);

UsersSettings.propTypes = {
  userCreateDefaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  userCreateIsSubmitting: PropTypes.bool.isRequired,
  userCreateError: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUserCreate: PropTypes.func.isRequired,
  onUserCreateMessageDismiss: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

UsersSettings.defaultProps = {
  userCreateError: undefined,
};

export default UsersSettings;
