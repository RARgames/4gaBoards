import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ResizeObserver } from '@juggle/resize-observer';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';

import { useField } from '../../hooks';

import styles from './NameEdit.module.scss';

const NameEdit = React.forwardRef(({ children, defaultValue, onUpdate, onClose, onHeightChange }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [value, handleFieldChange, setValue, handleFocus] = useField(defaultValue);

  const field = useRef(null);
  const resizeObserver = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setValue(defaultValue);
  }, [defaultValue, setValue]);

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

  const handleFieldClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const handleHeightChange = useCallback(
    (element) => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }

      if (!element) {
        resizeObserver.current = null;
        return;
      }
      resizeObserver.current = new ResizeObserver(() => {
        onHeightChange(element.clientHeight);
      });
      resizeObserver.current.observe(element);
    },
    [onHeightChange],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();

          submit();

          break;
        case 'Escape':
          submit();

          break;
        default:
      }
    },
    [submit],
  );

  const handleFieldBlur = useCallback(() => {
    submit();
  }, [submit]);

  useEffect(() => {
    if (isOpened) {
      field.current.ref.current.focus();
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <div className={styles.wrapper} ref={handleHeightChange}>
      <TextArea
        ref={field}
        as={TextareaAutosize}
        value={value}
        spellCheck
        maxRows={2}
        className={styles.field}
        onClick={handleFieldClick}
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
