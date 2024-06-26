import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, TextArea } from '../../Utils';
import { useClosableForm, useField } from '../../../hooks';

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

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close, isOpen);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.focus();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    handleClearModified();
    close();
  }, [value, defaultValue, handleClearModified, close, onUpdate]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    handleClearModified();
    close();
  }, [close, handleClearModified]);

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

  useEffect(() => {
    if (isOpen) {
      field.current.focus();
    }
  }, [isOpen]);

  const handleChange = useCallback(
    (event) => {
      handleFieldChange(event);
      handleValueChange(event, defaultValue);
    },
    [defaultValue, handleFieldChange, handleValueChange],
  );

  if (!isOpen) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextArea ref={field} value={value} className={styles.field} onKeyDown={handleFieldKeyDown} onChange={handleChange} onBlur={handleFieldBlur} onFocus={handleFocus} />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
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
