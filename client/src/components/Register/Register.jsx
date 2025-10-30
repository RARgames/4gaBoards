import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';

import logo from '../../assets/images/4gaboardsLogo1024w-white.png';
import { SsoTypes } from '../../constants/Enums';
import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, ExternalLink, Input, InputStyle, Form, Message, MessageStyle, Checkbox, Loader, LoaderSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './Register.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }
  switch (error.message) {
    case 'registrationDisabled':
      return {
        type: 'error',
        content: 'common.registrationDisabled',
      };
    case 'localRegistrationDisabled':
      return {
        type: 'error',
        content: 'common.localRegistrationDisabled',
      };
    case 'ssoRegistrationDisabled':
      return {
        type: 'error',
        content: 'common.ssoRegistrationDisabled',
      };
    case 'coreNotFound':
      return {
        type: 'error',
        content: 'common.coreNotFound',
      };
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
    case 'noOidcProfileFound':
      return {
        type: 'error',
        content: 'errors.noOidcProfileFound',
      };
    case 'domainNotAllowed':
      return {
        type: 'error',
        content: 'errors.domainNotAllowed',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const SSO_PROVIDERS = [
  { type: SsoTypes.GOOGLE, label: 'Google', icon: IconType.Google },
  { type: SsoTypes.MICROSOFT, label: 'Microsoft', icon: IconType.Microsoft },
  { type: SsoTypes.GITHUB, label: 'GitHub', icon: IconType.GitHub },
  { type: SsoTypes.OIDC, label: 'OIDC', icon: IconType.Key },
];

const Register = React.memo(
  ({
    defaultData,
    isSubmitting,
    error,
    ssoAvailable,
    oidcEnabledMethods,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    onRegister,
    onAuthenticateSso,
    onMessageDismiss,
    onLoginOpen,
  }) => {
    const [t] = useTranslation();
    const [isEmailError, setIsEmailError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isCheckboxError, setIsCheckboxError] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
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
        if (isCheckboxError) {
          setIsCheckboxError(false);
          onMessageDismiss();
        }
        setData({ ...data, policy: e.target.checked });
      },
      [data, isCheckboxError, onMessageDismiss, setData],
    );

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        email: data.email.trim(),
        name: data.email.split('@')[0],
      };
      if (!isEmail(cleanData.email)) {
        emailField.current?.focus();
        setIsEmailError(true);
        return;
      }
      if (!cleanData.password) {
        passwordField.current?.focus();
        setIsPasswordError(true);
        return;
      }

      setLoadingProvider('local');
      onRegister(cleanData);
    }, [onRegister, data]);

    useEffect(() => {
      if (error) {
        setLoadingProvider(null);
      }
    }, [error]);

    const handleSsoClick = useCallback(
      async (provider, method = null) => {
        const id = method ? `${provider}:${method}` : provider;
        setLoadingProvider(id);
        onAuthenticateSso(provider, method);
      },
      [onAuthenticateSso],
    );

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
            emailField.current?.focus();
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
      if (isEmailError) {
        setIsEmailError(false);
        onMessageDismiss();
      }
    }, [isEmailError, onMessageDismiss]);

    const handlePasswordKeyDown = useCallback(() => {
      if (isPasswordError) {
        setIsPasswordError(false);
        onMessageDismiss();
      }
    }, [isPasswordError, onMessageDismiss]);

    useDidUpdate(() => {
      passwordField.current?.focus();
    }, [focusPasswordFieldState]);

    return (
      <div className={clsx(s.wrapper, gs.scrollableY)}>
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
                    <div className={clsx(s.inputLabel, s.checkboxLabel)}>
                      {t('common.accept')} <ExternalLink href="https://4gaboards.com/terms-of-service">{t('common.termsOfService')}</ExternalLink> {t('common.and')}{' '}
                      <ExternalLink href="https://4gaboards.com/privacy-policy">{t('common.privacyPolicy')}</ExternalLink>
                    </div>
                    <Checkbox ref={policyCheckbox} name="policy" checked={data.policy} readOnly={isSubmitting} onChange={handlePolicyToggleChange} isError={isCheckboxError} />
                  </div>
                  <Button style={ButtonStyle.Login} type="submit" title={t('common.register')} disabled={isSubmitting} className={clsx(s.submitButton, s.button)} onClick={handleSubmit}>
                    {loadingProvider === 'local' ? (
                      <Loader size={LoaderSize.Small} />
                    ) : (
                      <>
                        {t('common.register')}
                        <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={s.submitButtonIcon} />
                      </>
                    )}
                  </Button>
                </>
              )}
            </Form>
            {registrationEnabled && ssoRegistrationEnabled && Object.values(ssoAvailable).some(Boolean) && (
              <>
                {localRegistrationEnabled && (
                  <div className={s.otherOptionsTextWrapper}>
                    <div className={s.otherOptionsLine} />
                    <div className={s.otherOptionsText}>{t('common.or')}</div>
                    <div className={s.otherOptionsLine} />
                  </div>
                )}
                <div className={s.otherOptions}>
                  {SSO_PROVIDERS.filter((p) => ssoAvailable[p.type] && (p.type !== SsoTypes.OIDC || oidcEnabledMethods.length === 0)).map((p) => (
                    <Button key={p.type} style={ButtonStyle.Login} title={t('common.continueWith', { provider: p.label })} onClick={() => handleSsoClick(p.type)} className={s.button}>
                      {loadingProvider === p.type ? (
                        <Loader size={LoaderSize.Small} />
                      ) : (
                        <>
                          <Icon type={p.icon} size={IconSize.Size20} className={s.ssoIcon} />
                          {t('common.continueWith', { provider: p.label })}
                        </>
                      )}
                    </Button>
                  ))}
                  {ssoAvailable[SsoTypes.OIDC] &&
                    oidcEnabledMethods.length > 0 &&
                    oidcEnabledMethods.map((method) => {
                      const id = `${SsoTypes.OIDC}:${method}`;
                      return (
                        <Button key={id} style={ButtonStyle.Login} title={t('common.continueWith', { provider: method })} onClick={() => handleSsoClick(SsoTypes.OIDC, method)} className={s.button}>
                          {loadingProvider === id ? (
                            <Loader size={LoaderSize.Small} />
                          ) : (
                            <>
                              <Icon type={IconType[method] || IconType.Key} size={IconSize.Size20} className={s.ssoIcon} />
                              {t('common.continueWith', { provider: method })}
                            </>
                          )}
                        </Button>
                      );
                    })}
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
  ssoAvailable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  oidcEnabledMethods: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  onRegister: PropTypes.func.isRequired,
  onAuthenticateSso: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onLoginOpen: PropTypes.func.isRequired,
};

Register.defaultProps = {
  error: undefined,
};

export default Register;
