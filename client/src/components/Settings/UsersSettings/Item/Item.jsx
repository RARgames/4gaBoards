import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Icon, IconType, IconSize, Radio, RadioSize, Table } from '../../../Utils';

import ActionsPopup from './ActionsPopup';
import User from '../../../User';

import styles from './Item.module.scss';
// TODO get date in correct local region format
const Item = React.memo(
  ({
    email,
    username,
    name,
    avatarUrl,
    organization,
    phone,
    ssoGoogleEmail,
    lastLogin,
    isAdmin,
    demoMode,
    emailUpdateForm,
    passwordUpdateForm,
    usernameUpdateForm,
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
    const options = { hour12: false, hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' };
    const handleIsAdminChange = useCallback(() => {
      onUpdate({
        isAdmin: !isAdmin,
      });
    }, [isAdmin, onUpdate]);

    return (
      <Table.Row className={styles.row}>
        <Table.Cell>
          <User name={name} avatarUrl={avatarUrl} aria-label={t('common.userAvatar')} />
        </Table.Cell>
        <Table.Cell title={name}>{name}</Table.Cell>
        <Table.Cell title={username}>{username || '-'}</Table.Cell>
        <Table.Cell title={email}>{email}</Table.Cell>
        <Table.Cell>
          <Radio size={RadioSize.Size12} checked={isAdmin} title={t('common.toggleAdmin')} disabled={demoMode} onChange={handleIsAdminChange} aria-label={t('common.toggleAdmin')} />
        </Table.Cell>
        <Table.Cell title={ssoGoogleEmail}>{ssoGoogleEmail || '-'}</Table.Cell>
        <Table.Cell title={lastLogin}>{lastLogin ? new Date(lastLogin).toLocaleString(undefined, options).replace(/,/g, '').split(' ').reverse().join(' ') : '-'}</Table.Cell>
        <Table.Cell>
          <ActionsPopup
            user={{
              email,
              username,
              name,
              organization,
              phone,
              isAdmin,
              emailUpdateForm,
              passwordUpdateForm,
              usernameUpdateForm,
            }}
            onUpdate={onUpdate}
            onUsernameUpdate={onUsernameUpdate}
            onUsernameUpdateMessageDismiss={onUsernameUpdateMessageDismiss}
            onEmailUpdate={onEmailUpdate}
            onEmailUpdateMessageDismiss={onEmailUpdateMessageDismiss}
            onPasswordUpdate={onPasswordUpdate}
            onPasswordUpdateMessageDismiss={onPasswordUpdateMessageDismiss}
            onDelete={onDelete}
            aria-label={t('common.editUser')}
            position="left-start"
            hideCloseButton
          >
            <Button style={ButtonStyle.Icon} title={t('common.editUser')} className={styles.editbutton}>
              <Icon type={IconType.Pencil} size={IconSize.Size14} />
            </Button>
          </ActionsPopup>
        </Table.Cell>
      </Table.Row>
    );
  },
);

Item.propTypes = {
  email: PropTypes.string.isRequired,
  username: PropTypes.string,
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  organization: PropTypes.string,
  phone: PropTypes.string,
  ssoGoogleEmail: PropTypes.string,
  lastLogin: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
  demoMode: PropTypes.bool.isRequired,
  /* eslint-disable react/forbid-prop-types */
  emailUpdateForm: PropTypes.object.isRequired,
  passwordUpdateForm: PropTypes.object.isRequired,
  usernameUpdateForm: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  onUpdate: PropTypes.func.isRequired,
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onPasswordUpdate: PropTypes.func.isRequired,
  onPasswordUpdateMessageDismiss: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

Item.defaultProps = {
  username: undefined,
  avatarUrl: undefined,
  organization: undefined,
  phone: undefined,
  ssoGoogleEmail: undefined,
  lastLogin: undefined,
};

export default Item;
