import isEmail from 'validator/lib/isEmail';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Form, Grid, Header, Message, Image } from 'semantic-ui-react';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Input } from '../../lib/custom-ui';

import { useForm } from '../../hooks';
import { isUsername } from '../../utils/validator';
import logo from '../../assets/images/4gaboardsLogo1024w-white.png';

import styles from './Login.module.scss';

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

const Login = React.memo(({ defaultData, isSubmitting, error, onAuthenticate, onMessageDismiss }) => {
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
    <div className={classNames(styles.wrapper, styles.fullHeight)}>
      <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
        <Grid.Column>
          <Grid verticalAlign="middle" className={styles.fullHeightPaddingFix}>
            <Grid.Column>
              <div className={styles.loginWrapper}>
                <Image centered src={logo} size="large" alt="4ga Boards" />
                <Header as="h1" textAlign="center" content={t('common.logInToBoards')} className={styles.formTitle} />
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
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputLabel}>{t('common.emailOrUsername')}</div>
                      <Input fluid ref={emailOrUsernameField} name="emailOrUsername" value={data.emailOrUsername} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
                    </div>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputLabel}>{t('common.password')}</div>
                      <Input.Password fluid ref={passwordField} name="password" value={data.password} readOnly={isSubmitting} className={styles.input} onChange={handleFieldChange} />
                    </div>
                    <Form.Button primary size="large" icon="right arrow" labelPosition="right" content={t('action.logIn')} floated="right" loading={isSubmitting} disabled={isSubmitting} />
                  </Form>
                </div>
              </div>
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    </div>
  );
});

Login.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onAuthenticate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: undefined,
};

export default Login;
