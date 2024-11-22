import React, { useCallback, useEffect, useState, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { TextArea } from '../Utils';

import { useField } from '../../hooks';

import * as styles from './NameField.module.scss';

const NameField = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
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

    if (cleanValue && cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }

    close();
  }, [defaultValue, onUpdate, value, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit();
          break;
        case 'Escape':
          close();
          break;
        default:
      }
    },
    [close, submit],
  );

  const handleFieldBlur = useCallback(() => {
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

  return <TextArea ref={field} value={value} className={styles.field} maxRows={3} onKeyDown={handleKeyDown} onChange={handleFieldChange} onBlur={handleFieldBlur} onFocus={handleFocus} />;
});

NameField.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameField);
