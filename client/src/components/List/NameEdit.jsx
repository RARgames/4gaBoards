import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { ResizeObserverSizeTypes } from '../../constants/Enums';
import { useField, useResizeObserverSize } from '../../hooks';
import { TextArea } from '../Utils';

import * as s from './NameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate, onClose, onHeightChange }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);

  const field = useRef(null);
  const [nameEditElement, setNameEditElement] = useState();
  const [nameEditHeight] = useResizeObserverSize(nameEditElement, ResizeObserverSizeTypes.CLIENT_HEIGHT);

  const open = useCallback(() => {
    setIsOpen(true);
    setValue(defaultValue);
    onHeightChange(nameEditHeight);
  }, [defaultValue, nameEditHeight, onHeightChange, setValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setValue(null);
    onClose();
  }, [onClose, setValue]);

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

  useEffect(() => {
    if (nameEditHeight) {
      onHeightChange(nameEditHeight);
    }
  }, [nameEditHeight, onHeightChange]);

  const handleFieldKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault(); // Prevent adding new line in TextArea
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
      field.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <div className={s.wrapper} ref={setNameEditElement}>
      <TextArea
        ref={field}
        value={value}
        placeholder={t('common.enterListName')}
        maxRows={2}
        className={s.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        onFocus={handleFocus}
      />
    </div>
  );
});

NameEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
