import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Grid, Header, Message, Image, Checkbox } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input } from '../../lib/custom-ui';
import { Icon, IconType, IconSize } from '../Utils/Icon';
import { Button, ButtonStyle } from '../Utils/Button';

import { useForm } from '../../hooks';
import logo from '../../assets/images/4gaboardsLogo1024w-white.png';

import styles from './Register.module.scss';

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
    onMessageDismiss,
    onLoginOpen,
    googleSsoEnabled,
    registrationEnabled,
    localRegistrationEnabled,
    ssoRegistrationEnabled,
  }) => {
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

    const handlePolicyToggleChange = useCallback(
      (e, { checked }) => {
        setData({ ...data, policy: checked });
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
      if (emailField.current) {
        // TODO this does not focus on page refresh
        emailField.current.focus();
      }
    }, []);

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
      <div className={classNames(styles.wrapper, styles.fullHeight)}>
        <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
          <Grid.Column>
            <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
              <Grid.Column>
                <div className={styles.loginWrapper}>
                  <Image centered src={logo} size="large" alt="4ga Boards" />
                  <Header as="h1" textAlign="center" content={t('common.createYourAccount')} className={styles.formTitle} />
                  <div>
                    {message && (
                      <Message
                        className={styles.message}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...{
                          [message.type]: true,
                        }}
                        visible
                        content={t(message.content)}
                        onDismiss={onMessageDismiss}
                      />
                    )}
                    <Form size="large" onSubmit={handleSubmit}>
                      {registrationEnabled && localRegistrationEnabled && (
                        <>
                          <div className={styles.inputWrapper}>
                            <div className={styles.inputLabel}>{t('common.email')}</div>
                            <Input fluid ref={emailField} name="email" value={data.email} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
                          </div>
                          <div className={styles.inputWrapper}>
                            <div className={styles.inputLabel}>{t('common.password')}</div>
                            <Input.Password fluid ref={passwordField} name="password" value={data.password} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
                          </div>
                          <div className={classNames(styles.inputWrapper, styles.checkboxWrapper)}>
                            <div className={styles.inputLabel}>
                              {t('common.accept')}{' '}
                              <a target="_blank" rel="noreferrer noopener" href="https://4gaboards.com/terms-of-service">
                                {t('common.termsOfService')}
                              </a>{' '}
                              {t('common.and')}{' '}
                              <a target="_blank" rel="noreferrer noopener" href="https://4gaboards.com/privacy-policy">
                                {t('common.privacyPolicy')}
                              </a>
                            </div>
                            <Checkbox ref={policyCheckbox} name="policy" checked={data.policy} readOnly={isSubmitting} className={styles.input} onChange={handlePolicyToggleChange} />
                          </div>
                        </>
                      )}
                      {!registrationEnabled && <div className={styles.registrationDisabledText}>{t('common.registrationDisabled')}</div>}
                      <div className={classNames(styles.buttonsContainer, !localRegistrationEnabled && styles.onlySsoButtonContainer)}>
                        {googleSsoEnabled && registrationEnabled && ssoRegistrationEnabled && (
                          <Button style={ButtonStyle.BackgroundFade} title={t('common.registerWithGoogle')} onClick={onAuthenticateGoogleSso} className={styles.ssoButton}>
                            {t('common.registerWithGoogle')}
                            <Icon type={IconType.Google} size={IconSize.Size20} className={styles.ssoIcon} />
                          </Button>
                        )}
                        {registrationEnabled && localRegistrationEnabled && (
                          <Button style={ButtonStyle.BackgroundFade} type="submit" title={t('common.register')} disabled={isSubmitting} className={styles.submitButton}>
                            {t('common.register')}
                            <Icon type={IconType.ArrowDown} size={IconSize.Size20} className={styles.submitButtonIcon} />
                          </Button>
                        )}
                      </div>
                    </Form>
                    <div className={styles.alternateActionText}>{t('common.alreadyUser')}</div>
                    <div className={styles.alternateActionButtonContainer}>
                      <Button style={ButtonStyle.BackgroundFade} content={t('common.backToLogin')} onClick={onLoginOpen} className={styles.alternateActionButton} />
                    </div>
                  </div>
                </div>
              </Grid.Column>
            </Grid>
          </Grid.Column>
        </Grid>
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
