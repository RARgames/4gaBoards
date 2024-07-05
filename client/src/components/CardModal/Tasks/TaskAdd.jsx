import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../../lib/hooks';
import { Button, ButtonStyle, Form, TextArea } from '../../Utils';
import { useForm } from '../../../hooks';

import styles from './TaskAdd.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const Add = React.forwardRef(({ children, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();

  const nameField = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsOpen(false);
  }, [setData]);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      name: data.name.trim(),
    };

    if (!cleanData.name) {
      nameField.current.focus();
      return;
    }

    onCreate(cleanData);
    setData(DEFAULT_DATA);
    focusNameField();
  }, [data, onCreate, setData, focusNameField]);

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

  const handleBlur = useCallback(
    (e) => {
      if (e.target.value.trim() === DEFAULT_DATA.name.trim()) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      nameField.current.focus();
    }
  }, [isOpen]);

  useDidUpdate(() => {
    nameField.current?.focus();
  }, [focusNameFieldState]);

  if (!isOpen) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <Form className={styles.wrapper} onSubmit={handleSubmit}>
      <TextArea
        ref={nameField}
        name="name"
        value={data.name}
        placeholder={t('common.enterTaskDescription')}
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleBlur}
      />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.addTask')} />
      </div>
    </Form>
  );
});

Add.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(Add);
