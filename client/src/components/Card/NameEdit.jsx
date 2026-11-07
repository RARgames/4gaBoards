import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { focusToEnd } from '../../hooks';
import { Button, ButtonVariant, Form, MentionTextArea, TextAreaVariant } from '../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, hasMentions } from '../Utils/Mention';

import * as gs from '../../global.module.scss';
import * as s from './NameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, boardMemberships, boardLabels, currentUserIds, currentLabelIds, onUpdate, onOpenChange }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, submitData, handleChange, resetValue] = useMentionValue(defaultValue);
  const [isError, setIsError] = useState(false);

  const field = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels, excludeUserIds: currentUserIds, excludeLabelIds: currentLabelIds });

  const open = useCallback(() => {
    setIsOpen(true);
    resetValue(defaultValue);
    setIsError(false);
  }, [defaultValue, resetValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    resetValue();
  }, [resetValue]);

  const submit = useCallback(() => {
    const name = getCleanName(value, submitData);

    if (!name) {
      field.current?.focus();
      setIsError(true);
      return;
    }

    if (name !== defaultValue || hasMentions(submitData)) {
      onUpdate(name, submitData);
    }

    close();
  }, [value, submitData, defaultValue, close, onUpdate]);

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

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  if (!isOpen) {
    return children;
  }

  return (
    <Form className={s.wrapper}>
      <MentionTextArea
        ref={field}
        variant={TextAreaVariant.Default}
        value={value}
        placeholder={t('common.enterCardName')}
        maxRows={2}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={focusToEnd}
        isError={isError}
        mentionTriggers={mentionTriggers}
      />
      <div className={gs.controls}>
        <Button variant={ButtonVariant.Cancel} content={t('common.cancel')} onClick={handleCancel} />
        <Button variant={ButtonVariant.Submit} content={t('common.save')} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

NameEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentLabelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onOpenChange: PropTypes.func,
};

NameEdit.defaultProps = {
  onOpenChange: undefined,
};

export default React.memo(NameEdit);
