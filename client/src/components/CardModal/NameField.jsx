import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { focusToEnd } from '../../hooks';
import { MentionTextArea } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, hasMentions } from '../Utils/Mention';

import * as s from './NameField.module.scss';

const NameField = React.forwardRef(({ children, defaultValue, boardLabels, boardMemberships, currentUserIds, currentLabelIds, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, submitData, handleChange, resetValue] = useMentionValue(defaultValue);
  const field = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels, excludeUserIds: currentUserIds, excludeLabelIds: currentLabelIds });

  const open = useCallback(() => {
    setIsOpen(true);
    resetValue(defaultValue);
  }, [defaultValue, resetValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    resetValue();
  }, [resetValue]);

  const submit = useCallback(() => {
    const name = getCleanName(value, submitData);

    if (name && (name !== defaultValue || hasMentions(submitData))) {
      onUpdate(name, submitData);
    }

    close();
  }, [value, submitData, defaultValue, onUpdate, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent adding new line in TextArea
        submit();
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [close, submit],
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
    <MentionTextArea
      ref={field}
      value={value}
      placeholder={t('common.enterCardName')}
      className={s.field}
      maxRows={3}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={submit}
      onFocus={focusToEnd}
      mentionTriggers={mentionTriggers}
    />
  );
});

NameField.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentLabelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameField);
