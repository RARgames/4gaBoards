import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useField } from '../../hooks';
import { Button, ButtonStyle, Form, TextArea, TextAreaStyle } from '../Utils';

import * as gs from '../../global.module.scss';
import * as s from './NameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const [isError, setIsError] = useState(false);

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
      field.current?.focus();
      setIsError(true);
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
    (e) => {
      setIsError(false);
      switch (e.key) {
        case 'Enter':
          e.preventDefault(); // Prevent adding new line in TextArea
          submit();
          break;
        case 'Escape':
          handleCancel();
          break;
        default:
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
      field.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <Form className={s.wrapper}>
      <TextArea
        ref={field}
        style={TextAreaStyle.Default}
        value={value}
        placeholder={t('common.enterCardName')}
        maxRows={2}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        isError={isError}
      />
      <div className={gs.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
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
