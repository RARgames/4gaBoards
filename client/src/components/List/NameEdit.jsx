import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import classNames from 'classnames';
import { TextArea } from 'semantic-ui-react';

import { useField, useResizeObserverSize } from '../../hooks';
import { ResizeObserverSizeTypes } from '../../constants/Enums';

import styles from './NameEdit.module.scss';
import gStyles from '../../globalStyles.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate, onClose, onHeightChange }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);

  const field = useRef(null);
  const [nameEditElement, setNameEditElement] = useState();
  const [nameEditHeight] = useResizeObserverSize(nameEditElement, ResizeObserverSizeTypes.CLIENT_HEIGHT);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
    onHeightChange(nameEditHeight);
  }, [defaultValue, nameEditHeight, onHeightChange, setValue]);

  const close = useCallback(() => {
    setIsOpened(false);
    setValue(null);
    onClose();
  }, [onClose, setValue]);

  const submit = useCallback(() => {
    const cleanValue = value.trim();

    if (cleanValue && cleanValue !== defaultValue) {
      onUpdate(cleanValue);
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
    if (nameEditHeight) {
      onHeightChange(nameEditHeight);
    }
  }, [nameEditHeight, onHeightChange]);

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();

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
    if (isOpened) {
      field.current.focus();
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <div className={styles.wrapper} ref={setNameEditElement}>
      <TextArea
        ref={field}
        as={TextareaAutosize}
        value={value}
        spellCheck
        maxRows={2}
        className={classNames(styles.field, gStyles.scrollableY)}
        onKeyDown={handleFieldKeyDown}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        onFocus={handleFocus}
      />
    </div>
  );
});

NameEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
};

export default React.memo(NameEdit);
