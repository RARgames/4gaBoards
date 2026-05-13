import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { isUsername } from '../../utils/validator';
import { Button, ButtonVariant, Popup, Input, InputVariant, Form, Message, MessageVariant } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './UserUsernameEditStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Username already in use':
      return {
        type: 'error',
        content: 'error.usernameAlreadyInUse',
      };
    case 'Invalid current password':
      return {
        type: 'error',
        content: 'error.invalidCurrentPassword',
      };
    case 'Insufficient permissions':
      return {
        type: 'error',
        content: 'error.insufficientPermissions',
      };
    default:
      return {
        type: 'warning',
        content: 'error.unknownError',
      };
  }
};

const UserUsernameEditStep = React.memo(({ defaultData, username, isSubmitting, error, usePasswordConfirmation, onUpdate, onMessageDismiss, onBack, onClose }) => {
  const [t] = useTranslation();
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    username: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const usernameField = useRef(null);
  const currentPasswordField = useRef(null);

  const handleSubmit = useCallback(() => {
    const cleanData = {
      ...data,
      username: data.username.trim() || null,
    };

    if (!cleanData.username || !isUsername(cleanData.username)) {
      usernameField.current?.focus();
      setIsUsernameError(true);
      return;
    }

    if (cleanData.username === username) {
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
  }, [username, usePasswordConfirmation, onUpdate, onClose, data]);

  useEffect(() => {
    usernameField.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Username already in use':
            usernameField.current?.focus();
            setIsUsernameError(true);

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
    if (usePasswordConfirmation) {
      currentPasswordField.current?.focus();
    }
  }, [focusCurrentPasswordFieldState]);

  useEffect(() => {
    onMessageDismiss();
  }, [onMessageDismiss]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editUsername', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {message && <Message variant={message.type === 'error' ? MessageVariant.Error : MessageVariant.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form>
          <div className={s.text}>{t('common.newUsername')}</div>
          <Input
            ref={usernameField}
            variant={InputVariant.Default}
            name="username"
            value={data.username}
            placeholder={username}
            onKeyDown={handleUsernameKeyDown}
            onChange={handleFieldChange}
            isError={isUsernameError}
          />
          {usePasswordConfirmation && (
            <>
              <div className={s.text}>{t('common.currentPassword')}</div>
              <Input.Password
                ref={currentPasswordField}
                variant={InputVariant.Default}
                name="currentPassword"
                value={data.currentPassword}
                onKeyDown={handlePasswordKeyDown}
                onChange={handleFieldChange}
                isError={isPasswordError}
              />
            </>
          )}
          <div className={gs.controls}>
            <Button variant={ButtonVariant.Submit} content={t('action.save')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

UserUsernameEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  username: PropTypes.string,
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  usePasswordConfirmation: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

UserUsernameEditStep.defaultProps = {
  username: undefined,
  error: undefined,
  usePasswordConfirmation: false,
  onBack: undefined,
};

export default UserUsernameEditStep;
