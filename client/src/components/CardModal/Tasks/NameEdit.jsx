import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import { useClosableForm, useField } from '../../../hooks';

import styles from './NameEdit.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(null);

  const field = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpened(false);
    setValue(null);
  }, [setValue]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close, isOpened);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      field.current.ref.current.select();
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
    if (isOpened) {
      field.current.ref.current.focus();
    }
  }, [isOpened]);

  const handleChange = useCallback(
    (_, { value: nextValue }) => {
      handleFieldChange(_, { value: nextValue });
      handleValueChange(nextValue, defaultValue);
    },
    [defaultValue, handleFieldChange, handleValueChange],
  );

  if (!isOpened) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.wrapper}>
      <TextArea
        ref={field}
        as={TextareaAutosize}
        value={value}
        minRows={1}
        spellCheck
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlur}
        onFocus={handleFocus}
      />
      <div className={gStyles.controls}>
        <Button type="button" negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button positive content={t('action.save')} className={gStyles.submitButton} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

NameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
