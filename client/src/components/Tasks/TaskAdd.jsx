import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDidUpdate, useToggle } from '../../lib/hooks';
import { TextArea } from '../Utils';
import { useForm } from '../../hooks';

import * as styles from './TaskAdd.module.scss';

const DEFAULT_DATA = {
  name: '',
};

const Add = React.forwardRef(({ children, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isError, setIsError] = useState(false);
  const nameField = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsError(false);
  }, []);

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    setIsOpen(false);
  }, [setData]);

  const submit = useCallback(
    (autoClose = false) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (cleanData && cleanData.name !== DEFAULT_DATA.name) {
        onCreate(cleanData);
        setData(DEFAULT_DATA);
      } else {
        setIsError(true);
      }
      focusNameField();

      if (autoClose) {
        close();
      }
    },
    [data, onCreate, setData, focusNameField, close],
  );

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
    submit(true);
  }, [submit]);

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
    <TextArea
      ref={nameField}
      name="name"
      value={data.name}
      placeholder={t('common.enterTaskDescription')}
      className={styles.field}
      isError={isError}
      onKeyDown={handleFieldKeyDown}
      onChange={handleFieldChange}
      onBlur={handleBlur}
    />
  );
});

Add.propTypes = {
  children: PropTypes.node.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(Add);
