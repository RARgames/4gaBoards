import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';

import { useForm } from '../../hooks';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Input, InputStyle, Form, Message, MessageStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './UserPasswordEditStep.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Invalid current password':
      return {
        type: 'error',
        content: 'common.invalidCurrentPassword',
      };
    case 'Weak password':
      return {
        type: 'error',
        content: 'common.weakPassword',
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

const UserPasswordEditStep = React.memo(({ defaultData, isSubmitting, error, usePasswordConfirmation, title, onUpdate, onMessageDismiss, onBack, onClose }) => {
  const [t] = useTranslation();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isNewPasswordError, setIsNewPasswordError] = useState(false);
  const wasSubmitting = usePrevious(isSubmitting);

  const [data, handleFieldChange, setData] = useForm({
    password: '',
    currentPassword: '',
    ...defaultData,
  });

  const message = useMemo(() => createMessage(error), [error]);
  const [focusCurrentPasswordFieldState, focusCurrentPasswordField] = useToggle();

  const passwordField = useRef(null);
  const currentPasswordField = useRef(null);

  const handleSubmit = useCallback(() => {
    if (!data.password) {
      passwordField.current.focus();
      setIsNewPasswordError(true);
      return;
    }

    if (usePasswordConfirmation && !data.currentPassword) {
      currentPasswordField.current.focus();
      setIsPasswordError(true);
      return;
    }

    onUpdate(usePasswordConfirmation ? data : omit(data, 'currentPassword'));
  }, [usePasswordConfirmation, onUpdate, data]);

  useEffect(() => {
    passwordField.current.focus({
      preventScroll: true,
    });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (!error) {
        onClose();
      } else if (error.message === 'Invalid current password') {
        setData((prevData) => ({
          ...prevData,
          currentPassword: '',
        }));
        focusCurrentPasswordField();
        setIsPasswordError(true);
      } else if (error.message === 'Weak password') {
        passwordField.current.focus();
        setIsNewPasswordError(true);
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose, setData, focusCurrentPasswordField]);

  const handlePasswordKeyDown = useCallback(() => {
    setIsPasswordError(false);
    onMessageDismiss();
  }, [onMessageDismiss]);

  const handleNewPasswordKeyDown = useCallback(() => {
    setIsNewPasswordError(false);
    onMessageDismiss();
  }, [onMessageDismiss]);

  useDidUpdate(() => {
    if (usePasswordConfirmation) {
      currentPasswordField.current.focus();
    }
  }, [focusCurrentPasswordFieldState]);

  useEffect(() => {
    onMessageDismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Popup.Header onBack={onBack}>{title || t('common.editPassword', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form>
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
          <div className={s.text}>{t('common.newPassword')}</div>
          <Input.Password
            withStrengthBar
            ref={passwordField}
            style={InputStyle.Default}
            name="password"
            value={data.password}
            onKeyDown={handleNewPasswordKeyDown}
            onChange={handleFieldChange}
            isError={isNewPasswordError}
          />
          <div className={gs.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.save')} disabled={isSubmitting} onClick={handleSubmit} />
          </div>
        </Form>
      </Popup.Content>
    </>
  );
});

UserPasswordEditStep.propTypes = {
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isSubmitting: PropTypes.bool.isRequired,
  error: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  usePasswordConfirmation: PropTypes.bool,
  title: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  onMessageDismiss: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};

UserPasswordEditStep.defaultProps = {
  error: undefined,
  title: undefined,
  usePasswordConfirmation: false,
  onBack: undefined,
};

export default UserPasswordEditStep;
