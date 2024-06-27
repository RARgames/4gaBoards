import { useCallback, useEffect, useRef } from 'react';

export default (close, isOpen = true) => {
  const isClosable = useRef(null);
  const isModified = useRef(null);

  const handleFieldBlur = useCallback(() => {
    if (isClosable.current && !isModified.current) {
      close();
    }
  }, [close]);

  // TODO check if needed in a current version
  const handleControlMouseOver = useCallback(() => {
    isClosable.current = false;
  }, []);

  // TODO check if needed in a current version
  const handleControlMouseOut = useCallback(() => {
    isClosable.current = true;
  }, []);

  const handleValueChange = useCallback((event, initValue) => {
    isModified.current = event.target.value.trim() !== initValue.trim();
  }, []);

  const handleClearModified = useCallback(() => {
    isModified.current = false;
  }, []);

  useEffect(() => {
    if (isOpen) {
      isClosable.current = true;
    } else {
      isClosable.current = null;
    }
  }, [isOpen]);

  return [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified];
};
