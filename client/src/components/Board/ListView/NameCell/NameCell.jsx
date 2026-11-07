import React, { useCallback, useEffect, useState, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { focusToEnd } from '../../../../hooks';
import { MentionTextArea, LinkifiedTextRenderer } from '../../../Utils';
import { useMentionTriggers, useMentionValue, getCleanName, hasMentions, applyMentionExtras } from '../../../Utils/Mention';

import * as gs from '../../../../global.module.scss';
import * as s from './NameCell.module.scss';

const NameCell = React.forwardRef(({ id, cellClassName, defaultValue, canEdit, boardMemberships, boardLabels, currentUserIds, currentLabelIds, onUpdate, onUserAdd, onLabelAdd, onSetNameCellFns }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, submitData, handleChange, resetValue] = useMentionValue(defaultValue);
  const field = useRef(null);
  const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels, excludeUserIds: currentUserIds, excludeLabelIds: currentLabelIds });

  const open = useCallback(() => {
    if (!canEdit) {
      return;
    }

    setIsOpen(true);
    resetValue(defaultValue);
  }, [canEdit, defaultValue, resetValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    resetValue();
  }, [resetValue]);

  const submit = useCallback(() => {
    const name = getCleanName(value, submitData);

    if (name && (name !== defaultValue || hasMentions(submitData))) {
      if (name !== defaultValue) {
        onUpdate({ name });
      }
      applyMentionExtras(submitData, {
        currentUserIds,
        currentLabelIds,
        onUserAdd,
        onLabelAdd,
        onDueDateUpdate: (dueDate) => onUpdate({ dueDate }),
      });
    }

    close();
  }, [defaultValue, onUpdate, value, submitData, close, currentUserIds, currentLabelIds, onUserAdd, onLabelAdd]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  useEffect(() => {
    onSetNameCellFns((prev) => ({ ...prev, [id]: { open } }));
  }, [id, open, onSetNameCellFns]);

  const handleKeyDown = useCallback(
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
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={clsx(cellClassName, s.nameCell, canEdit && gs.cursorPointer)} onClick={open} title={defaultValue} data-prevent-card-switch>
        <LinkifiedTextRenderer text={defaultValue} />
      </div>
    );
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
      onBlur={handleFieldBlur}
      onFocus={focusToEnd}
      mentionTriggers={mentionTriggers}
    />
  );
});

NameCell.propTypes = {
  id: PropTypes.string.isRequired,
  cellClassName: PropTypes.string,
  defaultValue: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentUserIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentLabelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUserAdd: PropTypes.func.isRequired,
  onLabelAdd: PropTypes.func.isRequired,
  onSetNameCellFns: PropTypes.func.isRequired,
};

NameCell.defaultProps = {
  cellClassName: '',
};

export default NameCell;
