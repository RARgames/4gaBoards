import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import EmailVerificationStatusPopup from '../../EmailVerificationStatusPopup';
import UserEmailEditPopup from '../../UserEmailEditPopup';
import UserUsernameEditPopup from '../../UserUsernameEditPopup';
import { Button, ButtonStyle } from '../../Utils';

import * as sShared from '../SettingsShared.module.scss';
import * as s from './AccountSettings.module.scss';

const AccountSettings = React.memo(
  ({
    email,
    isVerified,
    username,
    isPasswordAuthenticated,
    mailServiceAvailable,
    usernameUpdateForm,
    emailUpdateForm,
    onUsernameUpdate,
    onUsernameUpdateMessageDismiss,
    onEmailUpdate,
    onEmailUpdateMessageDismiss,
    onEmailVerificationResend,
  }) => {
    const [t] = useTranslation();
    const [emailVerificationPopupStatus, setEmailVerificationPopupStatus] = useState(null);
    const [emailVerificationPopupReason, setEmailVerificationPopupReason] = useState(null);

    const handleEmailVerificationPopupClose = useCallback(() => {
      setEmailVerificationPopupStatus(null);
      setEmailVerificationPopupReason(null);
    }, []);

    useEffect(() => {
      const url = new URL(window.location.href);
      const verificationResult = url.searchParams.get('emailVerification');
      const reason = url.searchParams.get('reason');

      if (!verificationResult) return;

      setEmailVerificationPopupStatus(verificationResult === 'success' ? 'success' : 'error');
      setEmailVerificationPopupReason(reason);
      url.searchParams.delete('emailVerification');
      url.searchParams.delete('reason');
      window.history.replaceState({}, document.title, url.toString());
    }, []);

    return (
      <div className={sShared.wrapper}>
        <div className={sShared.header}>
          <h2 className={sShared.headerText}>{t('common.account')}</h2>
        </div>
        <EmailVerificationStatusPopup
          isOpen={Boolean(emailVerificationPopupStatus)}
          variant={emailVerificationPopupStatus}
          status={emailVerificationPopupStatus}
          reason={emailVerificationPopupReason}
          onClose={handleEmailVerificationPopupClose}
        />
        <div>
          <div className={s.actionsWrapper}>
            <div className={s.action}>
              <span className={s.label}>
                <Trans i18nKey="common.currentUsername" values={{ username: username || t('common.notSet') }} components={{ username: <span className={s.usernameValue} /> }} />
              </span>
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
              <span className={s.label}>
                <Trans
                  i18nKey="common.currentEmail"
                  values={{
                    email,
                    status: isVerified ? t('common.verified') : t('common.notVerified'),
                  }}
                  components={{
                    email: <span className={s.emailValue} />,
                    status: <span className={isVerified ? s.statusVerified : s.statusNotVerified} />,
                  }}
                />
              </span>
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
            {mailServiceAvailable && (
              <div className={s.action}>
                <Button style={ButtonStyle.DefaultBorder} content={t('common.resendVerificationEmail', { context: 'title' })} onClick={onEmailVerificationResend} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

AccountSettings.propTypes = {
  email: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  username: PropTypes.string,
  isPasswordAuthenticated: PropTypes.bool.isRequired,
  mailServiceAvailable: PropTypes.bool.isRequired,
  usernameUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  emailUpdateForm: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUsernameUpdate: PropTypes.func.isRequired,
  onUsernameUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailUpdate: PropTypes.func.isRequired,
  onEmailUpdateMessageDismiss: PropTypes.func.isRequired,
  onEmailVerificationResend: PropTypes.func.isRequired,
};

AccountSettings.defaultProps = {
  username: undefined,
};

export default AccountSettings;
