import React, { useCallback, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useLocalStorage } from '../../hooks';
import { MDEditor, Button, ButtonStyle } from '../Utils';

import * as gStyles from '../../globalStyles.module.scss';
import * as s from './DescriptionEdit.module.scss';

const DescriptionEdit = React.forwardRef(({ defaultValue, onUpdate, cardId, descriptionHeight, descriptionMode, isGithubConnected, githubRepo, onCurrentUserPrefsUpdate, onLocalDescChange, onClose }, ref) => {
  const [t] = useTranslation();
  const [value, setValue] = useState(undefined);
  const textareaRef = useRef(null);
  const [wasOpen, setWasOpen] = useState(false);
  const [setLocalValue, getLocalValue] = useLocalStorage(`desc-${cardId}`);

  const setLocalDescription = useCallback(
    (desc) => {
      setLocalValue(desc);
    },
    [setLocalValue],
  );

  const focus = useCallback(() => {
    if (!textareaRef.current) return;

    textareaRef.current.focus();
    const { length } = textareaRef.current.value;
    textareaRef.current.setSelectionRange(length, length);
  }, []);

  const open = useCallback(() => {
    setValue(getLocalValue() || defaultValue || '');
  }, [defaultValue, getLocalValue]);

  const close = useCallback(
    (removeLocalDesc = false) => {
      if (removeLocalDesc) {
        setLocalDescription(null);
        onClose();
      }
    },
    [onClose, setLocalDescription],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus,
    }),
    [focus],
  );

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

  const handleBlur = useCallback(
    (event) => {
      if (event.relatedTarget && event.relatedTarget.closest(`.${s.editor}`)) {
        return;
      }

      const cleanValue = value.trim() || null;
      if (cleanValue === defaultValue) {
        close(true);
      } else if (cleanValue !== getLocalValue()) {
        setLocalDescription(cleanValue);
      } else {
        close();
      }
    },
    [value, getLocalValue, defaultValue, setLocalDescription, close],
  );

  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue);
      const cleanValue = newValue.trim() || null;
      onLocalDescChange(cleanValue !== getLocalValue() && cleanValue !== defaultValue);
    },
    [defaultValue, getLocalValue, onLocalDescChange],
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

  useEffect(() => {
    open();
    return () => {
      close(false);
    };
  }, [close, open]);

  const handlePreviewUpdate = useCallback(
    (preview) => {
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserPrefsUpdate({ descriptionMode: preview });
      }, 0);
      return () => clearTimeout(timeout);
    },
    [onCurrentUserPrefsUpdate],
  );

  return (
    <>
      <MDEditor
        value={value}
        ref={(node) => {
          if (node) {
            if (node.preview !== descriptionMode) {
              handlePreviewUpdate(node.preview);
            }
            if (node.textarea && !wasOpen) {
              setWasOpen(true);
              textareaRef.current = node.textarea;
              focus();
            }
          }
        }}
        onChange={handleChange}
        onBlur={handleBlur}
        height={Math.min(Math.max(descriptionHeight + 0.31 * descriptionHeight, 200), 650)}
        onKeyDown={handleEditorKeyDown}
        preview={descriptionMode}
        textareaProps={{
          placeholder: t('common.enterDescription'),
          spellCheck: 'true',
        }}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        className={s.editor}
      />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
      </div>
    </>
  );
});

DescriptionEdit.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  cardId: PropTypes.string.isRequired,
  descriptionHeight: PropTypes.number.isRequired,
  descriptionMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  onCurrentUserPrefsUpdate: PropTypes.func.isRequired,
  onLocalDescChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
};

export default React.memo(DescriptionEdit);
