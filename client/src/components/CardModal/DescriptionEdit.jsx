import React, { useCallback, useImperativeHandle, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { useLocalStorage } from '../../hooks';

import styles from './DescriptionEdit.module.scss';
import gStyles from '../../globalStyles.module.scss';

const DescriptionEdit = React.forwardRef(({ children, defaultValue, onUpdate, cardId, onLocalDescriptionChange }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [value, setValue] = useState(null);
  const [setLocalValue, getLocalValue] = useLocalStorage(`description-${cardId}`);

  const setLocalDescription = useCallback(
    (desc) => {
      setLocalValue(desc);
      onLocalDescriptionChange(desc);
    },
    [onLocalDescriptionChange, setLocalValue],
  );

  const open = useCallback(
    (ctrlKey = null) => {
      if (ctrlKey) {
        return;
      }
      setIsOpened(true);
      setValue(getLocalValue() || defaultValue || '');
    },
    [defaultValue, getLocalValue],
  );

  const close = useCallback(
    (removeLocalStorage = false) => {
      if (removeLocalStorage) {
        setLocalDescription(null);
      }
      setIsOpened(false);
    },
    [setLocalDescription],
  );

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      isOpened,
    }),
    [open, close, isOpened],
  );

  const isChanged = useCallback(() => {
    const cleanValue = value.trim() || null;
    return cleanValue !== defaultValue;
  }, [defaultValue, value]);

  const handleSubmit = useCallback(() => {
    const cleanValue = value.trim() || null;
    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }
    setValue(null);
    close(true);
  }, [defaultValue, onUpdate, value, close]);

  const handleCancel = useCallback(() => {
    setValue(null);
    close(true);
  }, [close]);

  const handleBlur = useCallback(() => {
    if (!isChanged()) {
      setLocalDescription(null);
      handleCancel();
    } else if (value) {
      const cleanValue = value.trim() || null;
      if (cleanValue !== getLocalValue()) {
        setLocalDescription(cleanValue);
      }
    }
  }, [isChanged, value, handleCancel, getLocalValue, setLocalDescription]);

  const handleChildrenClick = useCallback(
    (e) => {
      if (!getSelection().toString()) {
        open(e.ctrlKey);
      }
    },
    [open],
  );

  const handleEditorKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.ctrlKey && event.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleCancel, handleSubmit],
  );

  const help = {
    name: 'help',
    keyCommand: 'help',
    buttonProps: { 'aria-label': 'Open help', title: 'Open help' },
    icon: (
      <svg viewBox="0 0 16 16" width="12px" height="12px">
        <path
          d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.9 13H7v-1.8h1.9V13Zm-.1-3.6v.5H7.1v-.6c.2-2.1 2-1.9 1.9-3.2.1-.7-.3-1.1-1-1.1-.8 0-1.2.7-1.2 1.6H5c0-1.7 1.2-3 2.9-3 2.3 0 3 1.4 3 2.3.1 2.3-1.9 2-2.1 3.5Z"
          fill="currentColor"
        />
      </svg>
    ),
    execute: (state, api) => {
      window.open('https://www.markdownguide.org/basic-syntax/', '_blank');
    },
  };

  if (!isOpened) {
    return React.cloneElement(children, {
      onClick: handleChildrenClick,
    });
  }

  return (
    <>
      <MDEditor
        value={value}
        onChange={setValue}
        onBlur={handleBlur}
        height={400}
        maxHeight={650}
        autoFocus
        onKeyDown={handleEditorKeyDown}
        preview="edit"
        textareaProps={{
          placeholder: t('common.enterDescription'),
          spellCheck: 'true',
        }}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        commands={[...commands.getCommands(), help]}
      />
      <div className={gStyles.controls}>
        <Button negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} />
        <Button positive content={t('action.save')} className={gStyles.submitButton} onClick={handleSubmit} />
      </div>
    </>
  );
});

DescriptionEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  cardId: PropTypes.string.isRequired,
  onLocalDescriptionChange: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
};

export default React.memo(DescriptionEdit);
