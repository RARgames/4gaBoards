import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, usePrevious, useToggle } from '../../lib/hooks';
import { Button, ButtonStyle, Popup, Input, Form, Message, MessageStyle } from '../Utils';

import { useForm } from '../../hooks';
import { isUsername } from '../../utils/validator';

import styles from './UserUsernameEditStep.module.scss';
import gStyles from '../../globalStyles.module.scss';

const createMessage = (error) => {
  if (!error) {
    return error;
  }

  switch (error.message) {
    case 'Username already in use':
      return {
        type: 'error',
        content: 'common.usernameAlreadyInUse',
      };
    case 'Invalid current password':
      return {
        type: 'error',
        content: 'common.invalidCurrentPassword',
      };
    default:
      return {
        type: 'warning',
        content: 'common.unknownError',
      };
  }
};

const UserUsernameEditStep = React.memo(({ defaultData, username, isSubmitting, error, usePasswordConfirmation, onUpdate, onMessageDismiss, onBack, onClose, ssoGoogleEmail }) => {
  const [t] = useTranslation();
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
      usernameField.current.select();
      return;
    }

    if (cleanData.username === username) {
      onClose();
      return;
    }

    if (usePasswordConfirmation && !ssoGoogleEmail) {
      if (!cleanData.currentPassword) {
        currentPasswordField.current.focus();
        return;
      }
    } else {
      delete cleanData.currentPassword;
    }

    onUpdate(cleanData);
  }, [data, username, usePasswordConfirmation, ssoGoogleEmail, onUpdate, onClose]);

  useEffect(() => {
    usernameField.current.focus({
      preventScroll: true,
    });
  }, []);

  useEffect(() => {
    if (wasSubmitting && !isSubmitting) {
      if (error) {
        switch (error.message) {
          case 'Username already in use':
            usernameField.current.select();

            break;
          case 'Invalid current password':
            setData((prevData) => ({
              ...prevData,
              currentPassword: '',
            }));
            focusCurrentPasswordField();

            break;
          default:
        }
      } else {
        onClose();
      }
    }
  }, [isSubmitting, wasSubmitting, error, onClose, setData, focusCurrentPasswordField]);

  useDidUpdate(() => {
    if (!ssoGoogleEmail) {
      currentPasswordField.current.focus();
    }
  }, [focusCurrentPasswordFieldState]);

  return (
    <>
      <Popup.Header onBack={onBack}>{t('common.editUsername', { context: 'title' })}</Popup.Header>
      <Popup.Content>
        {message && <Message style={message.type === 'error' ? MessageStyle.Error : MessageStyle.Warning} content={t(message.content)} onDismiss={onMessageDismiss} />}
        <Form onSubmit={handleSubmit}>
          <div className={styles.text}>{t('common.newUsername')}</div>
          <Input ref={usernameField} name="username" value={data.username} placeholder={username} className={styles.field} onChange={handleFieldChange} />
          {usePasswordConfirmation && !ssoGoogleEmail && (
            <>
              <div className={styles.text}>{t('common.currentPassword')}</div>
              <Input.Password ref={currentPasswordField} name="currentPassword" value={data.currentPassword} className={styles.fieldPassword} onChange={handleFieldChange} />
            </>
          )}
          <div className={gStyles.controls}>
            <Button style={ButtonStyle.Submit} content={t('action.save')} disabled={isSubmitting} />
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
  // eslint-disable-next-line react/require-default-props
  ssoGoogleEmail: PropTypes.string,
};

UserUsernameEditStep.defaultProps = {
  username: undefined,
  error: undefined,
  usePasswordConfirmation: false,
  onBack: undefined,
};

export default UserUsernameEditStep;
