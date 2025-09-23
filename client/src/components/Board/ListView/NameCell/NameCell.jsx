import React, { useCallback, useEffect, useState, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { useField } from '../../../../hooks';
import { extractFirstLikelyUrl } from '../../../../utils/url';
import { TextArea, ExternalLink, Icon, IconType, IconSize } from '../../../Utils';

import * as gs from '../../../../global.module.scss';
import * as s from './NameCell.module.scss';

const NameCell = React.forwardRef(({ id, cellClassName, defaultValue, canEdit, onUpdate, onSetNameCellFns }, ref) => {
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

  const link = extractFirstLikelyUrl(defaultValue);
  const isLink = !!link;

  useEffect(() => {
    if (isOpen) {
      field.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div className={clsx(cellClassName, s.nameCell, canEdit && gs.cursorPointer)} onClick={open} title={defaultValue} data-prevent-card-switch>
        {isLink && (
          <ExternalLink href={link}>
            <Icon type={IconType.Link} size={IconSize.Size13} className={s.link} />
          </ExternalLink>
        )}
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
  id: PropTypes.string.isRequired,
  cellClassName: PropTypes.string,
  defaultValue: PropTypes.string.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onSetNameCellFns: PropTypes.func.isRequired,
};

NameCell.defaultProps = {
  cellClassName: '',
};

export default NameCell;
