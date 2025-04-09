import React, { useCallback, useEffect, useState, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { useField } from '../../../../hooks';
import { TextArea } from '../../../Utils';

import * as gs from '../../../../global.module.scss';
import * as s from './NameCell.module.scss';

const NameCell = React.forwardRef(({ cellClassName, defaultValue, canEdit, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);
  const field = useRef(null);

  const open = useCallback(() => {
    if (!canEdit) {
      return;
    }

    setIsOpen(true);
    setValue(defaultValue);
  }, [canEdit, defaultValue, setValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setValue(null);
  }, [setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (cleanValue && cleanValue !== defaultValue) {
      onUpdate({
        name: cleanValue,
      });
    }

    close();
  }, [defaultValue, onUpdate, value, close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault(); // Prevent adding new line in TextArea
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
      field.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={classNames(cellClassName, s.headerTitle, canEdit && gs.cursorPointer)} onClick={open} title={defaultValue} data-prevent-card-switch>
        {defaultValue}
      </div>
    );
  }

  return (
    <TextArea
      ref={field}
      value={value}
      placeholder={t('common.enterCardName')}
      className={s.field}
      maxRows={3}
      onKeyDown={handleKeyDown}
      onChange={handleFieldChange}
      onBlur={handleFieldBlur}
      onFocus={handleFocus}
    />
  );
});

NameCell.propTypes = {
  cellClassName: PropTypes.string,
  defaultValue: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

NameCell.defaultProps = {
  cellClassName: '',
};

export default NameCell;
