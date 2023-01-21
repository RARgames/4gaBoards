import { useCallback, useEffect, useRef } from 'react';

export default (close, isOpened = true) => {
  const isClosable = useRef(null);
  const isModified = useRef(null);

  const handleFieldBlur = useCallback(() => {
    if (isClosable.current && !isModified.current) {
      close();
    }
  }, [close]);

  const handleControlMouseOver = useCallback(() => {
    isClosable.current = false;
  }, []);

  const handleControlMouseOut = useCallback(() => {
    isClosable.current = true;
  }, []);

  const handleValueChange = useCallback((value, initValue) => {
    isModified.current = value.trim() !== initValue.trim();
  }, []);

  const handleClearModified = useCallback(() => {
    isModified.current = false;
  }, []);

  useEffect(() => {
    if (isOpened) {
      isClosable.current = true;
    } else {
      isClosable.current = null;
    }
  }, [isOpened]);

  return [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified];
};
