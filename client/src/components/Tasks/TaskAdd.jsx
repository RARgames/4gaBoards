import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useDidUpdate, useToggle } from '../../lib/hooks';
import { MentionTextArea } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, toExtras } from '../Utils/Mention';

import * as s from './TaskAdd.module.scss';

const TaskAdd = React.forwardRef(({ children, boardMemberships, onCreate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, submitData, handleChange, resetValue] = useMentionValue();
  const [focusNameFieldState, focusNameField] = useToggle();
  const [isError, setIsError] = useState(false);
  const nameField = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, withLabels: false });

  const open = useCallback(() => {
    setIsOpen(true);
    setIsError(false);
  }, []);

  const close = useCallback(() => {
    resetValue();
    setIsOpen(false);
  }, [resetValue]);

  const submit = useCallback(
    (autoClose = false) => {
      const name = getCleanName(value, submitData);

      if (name) {
        onCreate({ name, ...toExtras(submitData, { labels: false }) });
        resetValue();
      } else {
        setIsError(true);
      }
      focusNameField();

      if (autoClose) {
        close();
      }
    },
    [value, submitData, onCreate, resetValue, focusNameField, close],
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
    (e) => {
      setIsError(false);
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent adding new line in TextArea
        submit();
      } else if (e.key === 'Escape') {
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
      nameField.current?.focus();
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
    <MentionTextArea
      ref={nameField}
      value={value}
      placeholder={t('common.enterTaskDescription')}
      className={s.field}
      onKeyDown={handleFieldKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      isError={isError}
      mentionTriggers={mentionTriggers}
    />
  );
});

TaskAdd.propTypes = {
  children: PropTypes.node.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCreate: PropTypes.func.isRequired,
};

export default React.memo(TaskAdd);
