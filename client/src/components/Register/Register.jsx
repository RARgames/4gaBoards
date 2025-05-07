import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';

import logo from '../../assets/images/4gaboardsLogo1024w-white.png';
import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, ExternalLink, Input, InputStyle, Form, Message, MessageStyle, Checkbox } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './Register.module.scss';

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
  ({
    defaultData,
    isSubmitting,
    error,
    onRegister,
    onAuthenticateGoogleSso,
    onAuthenticateGithubSso,
    onMessageDismiss,
    onLoginOpen,
    googleSsoEnabled,
    githubSsoEnabled,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
  }) => {
    const [t] = useTranslation();
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isCheckboxError, setIsCheckboxError] = useState(false);
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
        setIsCheckboxError(false);
        onMessageDismiss();
        setData({ ...data, policy: e.target.checked });
      },
      [data, onMessageDismiss, setData],
    );

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
        name: data.email.split('@')[0],
      };
      if (!isEmail(cleanData.email)) {
        emailField.current.focus();
        setIsEmailError(true);
        return;
      }
      if (!cleanData.password) {
        passwordField.current.focus();
        setIsPasswordError(true);
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
            setIsPasswordError(true);
            break;
          case 'Email already in use':
            emailField.current.focus();
            setIsEmailError(true);
            break;
          case 'Policy not accepted':
            setIsCheckboxError(true);
            break;
          default:
        }
      }
    }, [isSubmitting, wasSubmitting, error, setData, focusPasswordField]);

    const handleEmailKeyDown = useCallback(() => {
      setIsEmailError(false);
      onMessageDismiss();
    }, [onMessageDismiss]);

    const handlePasswordKeyDown = useCallback(() => {
      setIsPasswordError(false);
      onMessageDismiss();
    }, [onMessageDismiss]);

    useDidUpdate(() => {
      passwordField.current.focus();
    }, [focusPasswordFieldState]);

    return (
      <div className={classNames(s.wrapper, gs.scrollableY)}>
        <div className={s.loginWrapper}>
          <img src={logo} className={s.logo} alt="4ga Boards" />
          <h1 className={s.formTitle}>{t('common.createYourAccount')}</h1>
          <div>
            {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} className={s.message} />}
            {(!registrationEnabled || (!localRegistrationEnabled && !ssoRegistrationEnabled)) && <div className={s.registrationDisabledText}>{t('common.registrationDisabled')}</div>}
            <Form>
              {registrationEnabled && localRegistrationEnabled && (
                <>
                  <div className={s.inputLabel}>{t('common.email')}</div>
                  <Input
                    ref={emailField}
                    style={InputStyle.LoginRegister}
                    name="email"
                    value={data.email}
                    readOnly={isSubmitting}
                    onKeyDown={handleEmailKeyDown}
                    onChange={handleFieldChange}
                    isError={isEmailError}
                  />
                  <div className={s.inputLabel}>{t('common.password')}</div>
                  <Input.Password
                    withStrengthBar
                    ref={passwordField}
                    style={InputStyle.LoginRegister}
                    name="password"
                    value={data.password}
                    readOnly={isSubmitting}
                    onKeyDown={handlePasswordKeyDown}
                    onChange={handleFieldChange}
                    isError={isPasswordError}
                  />
                  <div className={s.checkboxWrapper}>
                    <div className={classNames(s.inputLabel, s.checkboxLabel)}>
                      {t('common.accept')} <ExternalLink href="https://4gaboards.com/terms-of-service">{t('common.termsOfService')}</ExternalLink> {t('common.and')}{' '}
                      <ExternalLink href="https://4gaboards.com/privacy-policy">{t('common.privacyPolicy')}</ExternalLink>
                    </div>
                    <Checkbox ref={policyCheckbox} name="policy" checked={data.policy} readOnly={isSubmitting} onChange={handlePolicyToggleChange} isError={isCheckboxError} />
                  </div>
                  <Button style={ButtonStyle.Login} type="submit" title={t('common.register')} disabled={isSubmitting} className={s.submitButton} onClick={handleSubmit}>
                    {t('common.register')}
                    <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={s.submitButtonIcon} />
                  </Button>
                </>
              )}
            </Form>
            {registrationEnabled && ssoRegistrationEnabled && (googleSsoEnabled || githubSsoEnabled) && (
              <>
                {localRegistrationEnabled && (
                  <div className={s.otherOptionsTextWrapper}>
                    <div className={s.otherOptionsLine} />
                    <div className={s.otherOptionsText}>{t('common.or')}</div>
                    <div className={s.otherOptionsLine} />
                  </div>
                )}
                <div className={s.otherOptions}>
                  {googleSsoEnabled && registrationEnabled && ssoRegistrationEnabled && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'Google' })} onClick={onAuthenticateGoogleSso}>
                      <Icon type={IconType.Google} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'Google' })}
                    </Button>
                  )}
                  {githubSsoEnabled && registrationEnabled && ssoRegistrationEnabled && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'GitHub' })} onClick={onAuthenticateGithubSso}>
                      <Icon type={IconType.Github} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'GitHub' })}
                    </Button>
                  )}
                </div>
              </>
            )}
            <div className={s.alternateActionText}>{t('common.alreadyUser')}</div>
            <div className={s.alternateActionButtonContainer}>
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
  onAuthenticateGithubSso: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onLoginOpen: PropTypes.func.isRequired,
  googleSsoEnabled: PropTypes.bool.isRequired,
  githubSsoEnabled: PropTypes.bool.isRequired,
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
};

Register.defaultProps = {
  error: undefined,
};

export default Register;
