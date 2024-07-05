import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, TextArea } from '../../Utils';
import { useField } from '../../../hooks';

import styles from './TaskEdit.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(null);
  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.focus();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [value, defaultValue, close, onUpdate]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    close();
  }, [close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  const handleBlur = useCallback(
    (e) => {
      if (e.target.value.trim() === defaultValue.trim()) {
        close();
      }
    },
    [close, defaultValue],
  );

  useEffect(() => {
    if (isOpen) {
      field.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextArea ref={field} value={value} className={styles.field} onKeyDown={handleFieldKeyDown} onChange={handleFieldChange} onBlur={handleBlur} onFocus={handleFocus} />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} />
      </div>
    </Form>
  );
});

NameEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
