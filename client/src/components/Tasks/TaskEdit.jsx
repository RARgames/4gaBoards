import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { TextArea } from '../Utils';
import { useField } from '../../hooks';

import styles from './TaskEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(null);
  const field = useRef(null);
  const [isError, setIsError] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    setValue(defaultValue);
    setIsError(false);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      setIsError(true);
      field.current.focus();
      return;
    }

    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [value, defaultValue, close, onUpdate]);

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
      setIsError(false);
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      } else if (event.key === 'Escape') {
        close();
      }
    },
    [close, submit],
  );

  const handleBlur = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpen) {
      field.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <TextArea
      ref={field}
      value={value}
      placeholder={t('common.enterTaskDescription')}
      className={styles.field}
      isError={isError}
      onKeyDown={handleFieldKeyDown}
      onChange={handleFieldChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
});

NameEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);