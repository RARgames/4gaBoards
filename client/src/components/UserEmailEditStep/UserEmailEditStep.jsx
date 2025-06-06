import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';

import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, Message, MessageStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './UserEmailEditStep.module.scss';

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
    case 'Invalid current password':
      return {
        type: 'error',
        content: 'common.invalidCurrentPassword',
      };
    case 'Insufficient permissions':
      return {
        type: 'error',
        content: 'common.insufficientPermissions',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const UserEmailEditStep = React.memo(({ defaultData, email, isSubmitting, error, usePasswordConfirmation, onUpdate, onMessageDismiss, onBack, onClose }) => {
  const [t] = useTranslation();
  const [isEmailError, setIsEmailError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    email: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const emailField = useRef(null);
  const currentPasswordField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      email: data.email.trim(),
    };

    if (!isEmail(cleanData.email)) {
      emailField.current?.focus();
      setIsEmailError(true);
      return;
    }

    if (cleanData.email === email) {
      onClose();
      return;
    }

    if (usePasswordConfirmation) {
      if (!cleanData.currentPassword) {
        currentPasswordField.current?.focus();
        setIsPasswordError(true);
        return;
      }
    } else {
      delete cleanData.currentPassword;
    }

    onUpdate(cleanData);
  }, [email, usePasswordConfirmation, onUpdate, onClose, data]);

  useEffect(() => {
    emailField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Email already in use':
            emailField.current?.focus();
            setIsEmailError(true);

            break;
          case 'Invalid current password':
            setData((prevData) => ({
              ...prevData,
              currentPassword: '',
            }));
            focusCurrentPasswordField();
            setIsPasswordError(true);

            break;
          default:
        }
      } else {
        onClose();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose, setData, focusCurrentPasswordField]);

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

  useEffect(() => {
    onMessageDismiss();
  }, [onMessageDismiss]);

  useDidUpdate(() => {
    if (usePasswordConfirmation) {
      currentPasswordField.current?.focus();
    }
  }, [focusCurrentPasswordFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editEmail', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form>
          <div className={s.text}>{t('common.newEmail')}</div>
          <Input ref={emailField} style={InputStyle.Default} name="email" value={data.email} placeholder={email} onKeyDown={handleEmailKeyDown} onChange={handleFieldChange} isError={isEmailError} />
          {usePasswordConfirmation && (
            <>
              <div className={s.text}>{t('common.currentPassword')}</div>
              <Input.Password
                ref={currentPasswordField}
                style={InputStyle.Default}
                name="currentPassword"
                value={data.currentPassword}
                onKeyDown={handlePasswordKeyDown}
                onChange={handleFieldChange}
                isError={isPasswordError}
              />
            </>
          )}
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.save')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

UserEmailEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  email: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  usePasswordConfirmation: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

UserEmailEditStep.defaultProps = {
  error: undefined,
  usePasswordConfirmation: false,
  onBack: undefined,
};

export default UserEmailEditStep;
