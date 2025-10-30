import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';

import logo from '../../assets/images/4gaboardsLogo1024w-white.png';
import { SsoTypes } from '../../constants/Enums';
import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { isUsername } from '../../utils/validator';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, InputStyle, Form, Message, MessageStyle, Loader, LoaderSize } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './Login.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid username or password':
      return {
        type: 'error',
        content: 'common.invalidUsernameOrPassword',
      };
    case 'registrationDisabled':
      return {
        type: 'error',
        content: 'common.registrationDisabled',
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

const Login = React.memo(
  ({
    defaultData,
    isSubmitting,
    error,
    ssoAvailable,
    oidcEnabledMethods,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
    onAuthenticate,
    onAuthenticateSso,
    onMessageDismiss,
    onRegisterOpen,
  }) => {
    const [t] = useTranslation();
    const [isUsernameError, setIsUsernameError] = useState(false);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const wasSubmitting = usePrevious(isSubmitting);
    const [data, handleFieldChange, setData] = useForm(() => ({
      emailOrUsername: '',
      password: '',
      ...defaultData,
    }));

    const message = useMemo(() => createMessage(error), [error]);
    const [focusPasswordFieldState, focusPasswordField] = useToggle();

    const emailOrUsernameField = useRef(null);
    const passwordField = useRef(null);

    const mainTitle = '4ga Boards';

    useEffect(() => {
      document.title = `${t('common.login')} | ${mainTitle}`;
    }, [t]);

    const handleSubmit = useCallback(() => {
      const cleanData = {
        ...data,
        emailOrUsername: data.emailOrUsername.trim(),
      };

      if (!isEmail(cleanData.emailOrUsername) && !isUsername(cleanData.emailOrUsername)) {
        emailOrUsernameField.current?.focus();
        setIsUsernameError(true);
        return;
      }

      if (!cleanData.password) {
        passwordField.current?.focus();
        setIsPasswordError(true);
        return;
      }

      setLoadingProvider('local');
      onAuthenticate(cleanData);
    }, [onAuthenticate, data]);

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
      emailOrUsernameField.current?.focus();
    }, []);

    useEffect(() => {
      if (wasSubmitting && !isSubmitting && error) {
        switch (error.message) {
          case 'Invalid username or password':
            focusPasswordField();
            setIsUsernameError(true);
            setIsPasswordError(true);
            break;
          default:
        }
      }
    }, [isSubmitting, wasSubmitting, error, setData, focusPasswordField]);

    const handleUsernameKeyDown = useCallback(() => {
      if (isUsernameError) {
        setIsUsernameError(false);
        onMessageDismiss();
      }
    }, [isUsernameError, onMessageDismiss]);

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
          <h1 className={s.formTitle}>{t('common.logInToBoards')}</h1>
          <div>
            {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} className={s.message} />}
            <Form>
              <div className={s.inputLabel}>{t('common.emailOrUsername')}</div>
              <Input
                ref={emailOrUsernameField}
                style={InputStyle.LoginRegister}
                name="emailOrUsername"
                value={data.emailOrUsername}
                readOnly={isSubmitting}
                onKeyDown={handleUsernameKeyDown}
                onChange={handleFieldChange}
                isError={isUsernameError}
              />
              <div className={s.inputLabel}>{t('common.password')}</div>
              <Input.Password
                ref={passwordField}
                style={InputStyle.LoginRegister}
                name="password"
                value={data.password}
                readOnly={isSubmitting}
                onKeyDown={handlePasswordKeyDown}
                onChange={handleFieldChange}
                isError={isPasswordError}
              />
              <Button style={ButtonStyle.Login} type="submit" title={t('action.logIn')} disabled={isSubmitting} className={clsx(s.submitButton, s.button)} onClick={handleSubmit}>
                {loadingProvider === 'local' ? (
                  <Loader size={LoaderSize.Small} />
                ) : (
                  <>
                    {t('action.logIn')}
                    <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={s.submitButtonIcon} />
                  </>
                )}
              </Button>
            </Form>
            {Object.values(ssoAvailable).some(Boolean) && (
              <>
                <div className={s.otherOptionsTextWrapper}>
                  <div className={s.otherOptionsLine} />
                  <div className={s.otherOptionsText}>{t('common.or')}</div>
                  <div className={s.otherOptionsLine} />
                </div>
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
            {registrationEnabled && (localRegistrationEnabled || ssoRegistrationEnabled) && (
              <>
                <div className={s.alternateActionText}>{t('common.newToBoards')}</div>
                <div className={s.alternateActionButtonContainer}>
                  <Button style={ButtonStyle.Login} content={t('common.createAccount')} onClick={onRegisterOpen} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Login.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  ssoAvailable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  oidcEnabledMethods: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  registrationEnabled: PropTypes.bool.isRequired,
  localRegistrationEnabled: PropTypes.bool.isRequired,
  ssoRegistrationEnabled: PropTypes.bool.isRequired,
  onAuthenticate: PropTypes.func.isRequired,
  onAuthenticateSso: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onRegisterOpen: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: undefined,
};

export default Login;
