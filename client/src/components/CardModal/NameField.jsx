import React, { useCallback, useState, useRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { TextArea } from 'semantic-ui-react';
import { useDidUpdate, usePrevious } from '../../lib/hooks';

import { useField } from '../../hooks';

import styles from './NameField.module.scss';

const NameField = React.forwardRef(({ defaultValue, onUpdate }, ref) => {
  const prevDefaultValue = usePrevious(defaultValue);
  const [value, handleChange, setValue] = useField(defaultValue);

  const isFocused = useRef(false);
  const textArea = useRef(null);
  const [isSpellCheck, setIsSpellCheck] = useState(false);

  const open = useCallback(() => {
    textArea.current.focus();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open],
  );

  const handleFocus = useCallback(() => {
    isFocused.current = true;
    setIsSpellCheck(true);
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      event.target.blur();
    }
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    setIsSpellCheck(false);

    const cleanValue = value.trim();

    if (cleanValue) {
      if (cleanValue !== defaultValue) {
        onUpdate(cleanValue);
      }
    } else {
      setValue(defaultValue);
    }
  }, [defaultValue, onUpdate, value, setValue]);

  useDidUpdate(() => {
    if (!isFocused.current && defaultValue !== prevDefaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, prevDefaultValue, setValue]);

  return (
    <TextArea
      ref={textArea}
      as={TextareaAutosize}
      spellCheck={isSpellCheck}
      value={value}
      className={styles.field}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

NameField.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(NameField);
