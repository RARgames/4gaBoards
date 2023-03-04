import { useCallback, useEffect, useRef } from 'react';

export default (close, editorState, isOpened = true) => {
  const isClosable = useRef(null);
  const isModified = useRef(null);

  const handleFieldBlur = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    const text = contentState.getPlainText().trim();
    if (isClosable.current && !isModified.current && !text) {
      close();
    }
  }, [close, editorState]);

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
