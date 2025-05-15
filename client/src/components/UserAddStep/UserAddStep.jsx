import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';

import { useForm } from '../../hooks';
import { usePrevious } from '../../lib/hooks';
import { isUsername } from '../../utils/validator';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, Message, MessageStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './UserAddStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Email already in use':
      return {
        type: 'error',
        content: 'common.emailAlreadyInUse',
      };
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    case 'Weak password':
      return {
        type: 'error',
        content: 'common.weakPassword',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const UserAddStep = React.memo(({ defaultData, isSubmitting, error, onCreate, onMessageDismiss, onClose }) => {
  const [t] = useTranslation();
  const [isEmailError, setIsEmailError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isNameError, setIsNameError] = useState(false);
  const [isUsernameError, setIsUsernameError] = useState(false);
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange] = useForm(() => ({
    email: '',
    password: '',
    name: '',
    username: '',
    ...defaultData,
  }));

  const message = useMemo(() => createMessage(error), [error]);

  const emailField = useRef(null);
  const passwordField = useRef(null);
  const nameField = useRef(null);
  const usernameField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      email: data.email.trim(),
      name: data.name.trim(),
      username: data.username ? data.username.trim() : null,
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

    if (!cleanData.name) {
      nameField.current.focus();
      setIsNameError(true);
      return;
    }

    if (cleanData.username && !isUsername(cleanData.username)) {
      usernameField.current.focus();
      setIsUsernameError(true);
      return;
    }

    onCreate(cleanData);
  }, [onCreate, data]);

  useEffect(() => {
    emailField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Email already in use':
            emailField.current.focus();
            setIsEmailError(true);

            break;
          case 'Username already in use':
            usernameField.current.focus();
            setIsUsernameError(true);

            break;
          case 'Weak password':
            passwordField.current.focus();
            setIsPasswordError(true);

            break;
          default:
        }
      } else {
        onClose();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose]);

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

  const handleNameKeyDown = useCallback(() => {
    if (isNameError) {
      setIsNameError(false);
      onMessageDismiss();
    }
  }, [isNameError, onMessageDismiss]);

  const handleUsernameKeyDown = useCallback(() => {
    if (isUsernameError) {
      setIsUsernameError(false);
      onMessageDismiss();
    }
  }, [isUsernameError, onMessageDismiss]);

  useEffect(() => {
    onMessageDismiss();
  }, [onMessageDismiss]);

  return (
    <>
      <Popup.Header>{t('common.addUser')}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form>
          <div className={s.text}>{t('common.email')}</div>
          <Input ref={emailField} name="email" style={InputStyle.Default} value={data.email} readOnly={isSubmitting} onKeyDown={handleEmailKeyDown} onChange={handleFieldChange} isError={isEmailError} />
          <div className={s.text}>{t('common.password')}</div>
          <Input.Password
            withStrengthBar
            ref={passwordField}
            style={InputStyle.Default}
            name="password"
            value={data.password}
            readOnly={isSubmitting}
            onKeyDown={handlePasswordKeyDown}
            onChange={handleFieldChange}
            isError={isPasswordError}
          />
          <div className={s.text}>{t('common.name')}</div>
          <Input ref={nameField} name="name" style={InputStyle.Default} value={data.name} readOnly={isSubmitting} onKeyDown={handleNameKeyDown} onChange={handleFieldChange} isError={isNameError} />
          <div className={s.text}>
            {t('common.username')} ({t('common.optional', { context: 'inline' })})
          </div>
          <Input
            ref={usernameField}
            style={InputStyle.Default}
            name="username"
            value={data.username || ''}
            readOnly={isSubmitting}
            onKeyDown={handleUsernameKeyDown}
            onChange={handleFieldChange}
            isError={isUsernameError}
          />
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('common.addUser')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

UserAddStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

UserAddStep.defaultProps = {
  error: undefined,
};

export default UserAddStep;
