import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { focusToEnd } from '../../hooks';
import { MentionTextArea } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, hasMentions, toExtras } from '../Utils/Mention';

import * as s from './TaskEdit.module.scss';

const TaskEdit = React.forwardRef(({ children, defaultValue, boardMemberships, currentUserIds, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, submitData, handleChange, resetValue] = useMentionValue();
  const [isError, setIsError] = useState(false);
  const field = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, withLabels: false, excludeUserIds: currentUserIds });

  const open = useCallback(() => {
    setIsOpen(true);
    resetValue(defaultValue);
    setIsError(false);
  }, [defaultValue, resetValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    resetValue();
  }, [resetValue]);

  const submit = useCallback(
    (blurOnEmpty = false) => {
      const name = getCleanName(value, submitData);

      if (!name) {
        if (blurOnEmpty && isError) {
          close();
          return;
        }
        setIsError(true);
        field.current?.focus();
        return;
      }

      if (name !== defaultValue || hasMentions(submitData)) {
        onUpdate(name, toExtras(submitData, { labels: false }));
      }

      close();
    },
    [value, submitData, defaultValue, close, isError, onUpdate],
  );

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
      field.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <MentionTextArea
      ref={field}
      value={value}
      placeholder={t('common.enterTaskDescription')}
      className={s.field}
      isError={isError}
      onKeyDown={handleFieldKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={focusToEnd}
      mentionTriggers={mentionTriggers}
    />
  );
});

TaskEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(TaskEdit);
