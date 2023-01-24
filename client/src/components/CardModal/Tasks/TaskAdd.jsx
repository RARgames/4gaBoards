import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';
import { useDidUpdate, useToggle } from '../../../lib/hooks';

import { useClosableForm, useForm } from '../../../hooks';

import styles from './TaskAdd.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const Add = React.forwardRef(({ children, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
  }, []);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsOpened(false);
  }, [setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close, isOpened);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.ref.current.select();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    handleClearModified();
    focusNameField();
  }, [data, onCreate, setData, handleClearModified, focusNameField]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    setData(DEFAULT_DATA);
    handleClearModified();
    close();
  }, [close, handleClearModified, setData]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleChildrenClick = useCallback(() => {
    open();
  }, [open]);

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
      nameField.current.ref.current.focus();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    nameField.current.ref.current.focus();
  }, [focusNameFieldState]);

  const handleChange = useCallback(
    (_, { name: fieldName, value }) => {
      handleFieldChange(_, { name: fieldName, value });
      handleValueChange(value, DEFAULT_DATA.name);
    },
    [handleFieldChange, handleValueChange],
  );

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea
        ref={nameField}
        as={TextareaAutosize}
        name="name"
        value={data.name}
        placeholder={t('common.enterTaskDescription')}
        minRows={1}
        spellCheck
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlur}
      />
      <div className={gStyles.controls}>
        <Button type="button" negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button positive content={t('action.addTask')} className={gStyles.submitButton} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

Add.propTypes = {
  children: PropTypes.element.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(Add);
