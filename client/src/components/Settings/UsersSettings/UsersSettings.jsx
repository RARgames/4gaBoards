import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ButtonStyle } from '../../Utils/Button';

import UserAddPopupContainer from '../../../containers/UserAddPopupContainer';
import Item from './Item';

import styles from './UsersSettings.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const UsersSettings = React.memo(
  ({ items, onUpdate, onUsernameUpdate, onUsernameUpdateMessageDismiss, onEmailUpdate, onEmailUpdateMessageDismiss, onPasswordUpdate, onPasswordUpdateMessageDismiss, onDelete }) => {
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
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.headerText}>{t('common.users')}</h2>
          <div className={styles.headerButton}>
            <UserAddPopupContainer>
              <Button style={ButtonStyle.Submit} content={t('action.addUser')} />
            </UserAddPopupContainer>
          </div>
        </div>
        <div className={classNames(styles.tableWrapper, gStyles.scrollableXY)}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeaderCell} aria-label={t('common.avatar')} />
                <th className={styles.tableHeaderCell}>{t('common.name')}</th>
                <th className={styles.tableHeaderCell}>{t('common.username')}</th>
                <th className={styles.tableHeaderCell}>{t('common.email')}</th>
                <th className={styles.tableHeaderCell}>{t('common.administrator')}</th>
                <th className={styles.tableHeaderCell}>{t('common.ssoGoogleEmail')}</th>
                <th className={styles.tableHeaderCell}>{t('common.lastLogin')}</th>
                <th className={styles.tableHeaderCell} aria-label={t('common.editUser')} />
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
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
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

UsersSettings.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UsersSettings;
