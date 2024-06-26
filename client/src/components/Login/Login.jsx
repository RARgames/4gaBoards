import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Icon, IconType, IconSize, Input, Form, Message, MessageStyle } from '../Utils';

import { useForm } from '../../hooks';
import { isUsername } from '../../utils/validator';
import logo from '../../assets/images/4gaboardsLogo1024w-white.png';

import styles from './Login.module.scss';
import gStyles from '../../globalStyles.module.scss';

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
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const Login = React.memo(({ defaultData, isSubmitting, error, onAuthenticate, onAuthenticateGoogleSso, onMessageDismiss, onRegisterOpen, googleSsoEnabled, registrationEnabled }) => {
  const [t] = useTranslation();
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
      emailOrUsernameField.current.select();
      return;
    }

    if (!cleanData.password) {
      passwordField.current.focus();
      return;
    }

    onAuthenticate(cleanData);
  }, [onAuthenticate, data]);

  useEffect(() => {
    emailOrUsernameField.current.focus();
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting && error) {
      switch (error.message) {
        case 'Invalid username or password':
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
        <h1 className={styles.formTitle}>{t('common.logInToBoards')}</h1>
        <div>
          {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} className={styles.message} />}
          <Form onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
              <Input ref={emailOrUsernameField} name="emailOrUsername" value={data.emailOrUsername} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.inputLabel}>{t('common.password')}</div>
              <Input.Password ref={passwordField} name="password" value={data.password} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
            </div>
            <div className={styles.buttonsContainer}>
              {googleSsoEnabled && (
                <Button style={ButtonStyle.Login} title={t('common.loginWithGoogle')} onClick={onAuthenticateGoogleSso} className={styles.ssoButton}>
                  {t('common.loginWithGoogle')}
                  <Icon type={IconType.Google} size={IconSize.Size20} className={styles.ssoIcon} />
                </Button>
              )}
              <Button style={ButtonStyle.Login} type="submit" title={t('action.logIn')} disabled={isSubmitting} className={styles.submitButton}>
                {t('action.logIn')}
                <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={styles.submitButtonIcon} />
              </Button>
            </div>
          </Form>
          {registrationEnabled && (
            <>
              <div className={styles.alternateActionText}>{t('common.newToBoards')}</div>
              <div className={styles.alternateActionButtonContainer}>
                <Button style={ButtonStyle.Login} content={t('common.createAccount')} onClick={onRegisterOpen} className={styles.alternateActionButton} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

Login.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onAuthenticate: PropTypes.func.isRequired,
  onAuthenticateGoogleSso: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onRegisterOpen: PropTypes.func.isRequired,
  googleSsoEnabled: PropTypes.bool.isRequired,
  registrationEnabled: PropTypes.bool.isRequired,
};

Login.defaultProps = {
  error: undefined,
};

export default Login;
