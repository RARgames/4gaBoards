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
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, InputStyle, Form, Message, MessageStyle } from '../Utils';

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

      onAuthenticate(cleanData);
    }, [onAuthenticate, data]);

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
                {t('action.logIn')}
                <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={s.submitButtonIcon} />
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
                  {ssoAvailable[SsoTypes.GOOGLE] && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'Google' })} onClick={() => onAuthenticateSso(SsoTypes.GOOGLE)} className={s.button}>
                      <Icon type={IconType.Google} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'Google' })}
                    </Button>
                  )}
                  {ssoAvailable[SsoTypes.MICROSOFT] && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'Microsoft' })} onClick={() => onAuthenticateSso(SsoTypes.MICROSOFT)} className={s.button}>
                      <Icon type={IconType.Microsoft} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'Microsoft' })}
                    </Button>
                  )}
                  {ssoAvailable[SsoTypes.GITHUB] && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'GitHub' })} onClick={() => onAuthenticateSso(SsoTypes.GITHUB)} className={s.button}>
                      <Icon type={IconType.GitHub} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'GitHub' })}
                    </Button>
                  )}
                  {ssoAvailable[SsoTypes.OIDC] && oidcEnabledMethods.length === 0 && (
                    <Button style={ButtonStyle.Login} title={t('common.continueWith', { provider: 'OIDC' })} onClick={() => onAuthenticateSso(SsoTypes.OIDC)} className={s.button}>
                      <Icon type={IconType.Key} size={IconSize.Size20} className={s.ssoIcon} />
                      {t('common.continueWith', { provider: 'OIDC' })}
                    </Button>
                  )}
                  {ssoAvailable[SsoTypes.OIDC] &&
                    oidcEnabledMethods.length > 0 &&
                    oidcEnabledMethods.map((method) => (
                      <Button key={method} style={ButtonStyle.Login} title={t('common.continueWith', { provider: method })} onClick={() => onAuthenticateSso(SsoTypes.OIDC, method)} className={s.button}>
                        <Icon type={IconType[method] || IconType.Key} size={IconSize.Size20} className={s.ssoIcon} />
                        {t('common.continueWith', { provider: method })}
                      </Button>
                    ))}
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
