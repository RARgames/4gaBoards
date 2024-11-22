import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, ExternalLink, Input, Form, Message, MessageStyle, Checkbox } from '../Utils';

import { useForm } from '../../hooks';
import logo from '../../assets/images/4gaboardsLogo1024w-white.png';

import * as styles from './Register.module.scss';
import * as gStyles from '../../globalStyles.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }
  switch (error.message) {
    case 'Failed to fetch':
      return {
        type: 'warning',
        content: 'common.noInternetConnection',
      };
    case 'Network request failed':
      return {
        type: 'warning',
        content: 'common.serverConnectionFailed',
      };
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
    case 'Weak password':
      return {
        type: 'error',
        content: 'common.weakPassword',
      };
    case 'Policy not accepted':
      return {
        type: 'error',
        content: 'common.policyNotAccepted',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const Register = React.memo(
  ({ defaultData, isSubmitting, error, onRegister, onAuthenticateGoogleSso, onMessageDismiss, onLoginOpen, googleSsoEnabled, registrationEnabled, localRegistrationEnabled, ssoRegistrationEnabled }) => {
    const [t] = useTranslation();
    const wasSubmitting = usePrevious(isSubmitting);
    const [data, handleFieldChange, setData] = useForm(() => ({
      email: '',
      password: '',
      policy: false,
      ...defaultData,
    }));

    const message = useMemo(() => createMessage(error), [error]);
    const [focusPasswordFieldState, focusPasswordField] = useToggle();

    const emailField = useRef(null);
    const passwordField = useRef(null);
    const policyCheckbox = useRef(null);

    const mainTitle = '4ga Boards';

    useEffect(() => {
      document.title = `${t('common.register')} | ${mainTitle}`;
    }, [t]);

    const handlePolicyToggleChange = useCallback(
      (e) => {
        setData({ ...data, policy: e.target.checked });
      },
      [data, setData],
    );

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
        name: data.email.split('@')[0],
      };
      if (!isEmail(cleanData.email)) {
        emailField.current.select();
        return;
      }
      if (!cleanData.password) {
        passwordField.current.focus();
        return;
      }

      onRegister(cleanData);
    }, [onRegister, data]);

    useEffect(() => {
      emailField.current?.focus();
    }, [registrationEnabled, localRegistrationEnabled]); // necessary deps, because form loads after page load

    useEffect(() => {
      if (wasSubmitting && !isSubmitting && error) {
        switch (error.message) {
          case 'Weak password':
            focusPasswordField();
            break;
          default:
        }
      }
    }, [isSubmitting, wasSubmitting, error, setData, focusPasswordField]);

    useDidUpdate(() => {
      passwordField.current.focus();
    }, [focusPasswordFieldState]);

    return (
      <div className={classNames(styles.wrapper, gStyles.scrollableY)}>
        <div className={styles.loginWrapper}>
          <img src={logo} className={styles.logo} alt="4ga Boards" />
          <h1 className={styles.formTitle}>{t('common.createYourAccount')}</h1>
          <div>
            {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} className={styles.message} />}
            <Form onSubmit={handleSubmit}>
              {registrationEnabled && localRegistrationEnabled && (
                <>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputLabel}>{t('common.email')}</div>
                    <Input ref={emailField} name="email" value={data.email} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
                  </div>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputLabel}>{t('common.password')}</div>
                    <Input.Password ref={passwordField} name="password" value={data.password} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} withStrengthBar />
                  </div>
                  <div className={classNames(styles.inputWrapper, styles.checkboxWrapper)}>
                    <div className={classNames(styles.inputLabel, styles.checkboxLabel)}>
                      {t('common.accept')} <ExternalLink href="https://4gaboards.com/terms-of-service">{t('common.termsOfService')}</ExternalLink> {t('common.and')}{' '}
                      <ExternalLink href="https://4gaboards.com/privacy-policy">{t('common.privacyPolicy')}</ExternalLink>
                    </div>
                    <Checkbox ref={policyCheckbox} name="policy" checked={data.policy} readOnly={isSubmitting} onChange={handlePolicyToggleChange} />
                  </div>
                </>
              )}
              {(!registrationEnabled || (!localRegistrationEnabled && !ssoRegistrationEnabled)) && <div className={styles.registrationDisabledText}>{t('common.registrationDisabled')}</div>}
              <div className={classNames(styles.buttonsContainer, !localRegistrationEnabled && styles.onlySsoButtonContainer)}>
                {googleSsoEnabled && registrationEnabled && ssoRegistrationEnabled && (
                  <Button style={ButtonStyle.Login} title={t('common.registerWithGoogle')} onClick={onAuthenticateGoogleSso}>
                    {t('common.registerWithGoogle')}
                    <Icon type={IconType.Google} size={IconSize.Size20} className={styles.ssoIcon} />
                  </Button>
                )}
                {registrationEnabled && localRegistrationEnabled && (
                  <Button style={ButtonStyle.Login} type="submit" title={t('common.register')} disabled={isSubmitting} className={styles.submitButton}>
                    {t('common.register')}
                    <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={styles.submitButtonIcon} />
                  </Button>
                )}
              </div>
            </Form>
            <div className={styles.alternateActionText}>{t('common.alreadyUser')}</div>
            <div className={styles.alternateActionButtonContainer}>
              <Button style={ButtonStyle.Login} content={t('common.backToLogin')} onClick={onLoginOpen} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Register.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onRegister: PropTypes.func.isRequired,
  onAuthenticateGoogleSso: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onLoginOpen: PropTypes.func.isRequired,
  googleSsoEnabled: PropTypes.bool.isRequired,
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
};

Register.defaultProps = {
  error: undefined,
};

export default Register;
