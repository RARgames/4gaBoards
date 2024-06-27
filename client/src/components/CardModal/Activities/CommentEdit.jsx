import { dequal } from 'dequal';
import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, ButtonStyle, Form, MDEditor } from '../../Utils';

import { useForm } from '../../../hooks';

import styles from './CommentEdit.module.scss';
import gStyles from '../../../globalStyles.module.scss';

const CommentEdit = React.forwardRef(({ children, defaultData, placeholder, commentMode, isGithubConnected, githubRepo, onUpdate, onCurrentUserUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [data, handleFieldChange, setData] = useForm(null);
  const textareaRef = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setData({
      text: '',
      ...defaultData,
    });
  }, [defaultData, setData]);

  const close = useCallback(() => {
    setIsOpened(false);
    setData(null);
  }, [setData]);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current.focus();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    close();
  }, [data, defaultData, close, onUpdate]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    close();
  }, [close]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  const handleChange = useCallback(
    (value) => {
      const event = { target: { name: 'text', value } }; // TODO get name from mdEditorRef.current (causing first input delay)
      handleFieldChange(event);
    },
    [handleFieldChange],
  );

  const handleBlur = useCallback(
    (event) => {
      if (event.relatedTarget && event.relatedTarget.closest(`.${styles.editor}`)) {
        return;
      }

      if (event.target.value.trim() === defaultData.text.trim()) {
        handleCancel();
      }
    },
    [defaultData.text, handleCancel],
  );

  const handlePreviewUpdate = useCallback(
    (preview) => {
      // TODO hacky way to update UI faster
      const timeout = setTimeout(() => {
        onCurrentUserUpdate({ commentMode: preview });
      }, 0);
      return () => clearTimeout(timeout);
    },
    [onCurrentUserUpdate],
  );

  useEffect(() => {
    if (!isOpened) {
      setWasOpen(false);
    }
  }, [isOpened]);

  if (!isOpened) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <MDEditor
        name="text"
        value={data.text}
        ref={(node) => {
          if (node) {
            if (node.preview !== commentMode) {
              handlePreviewUpdate(node.preview);
            }
            if (node.textarea && !wasOpen) {
              setWasOpen(true);
              textareaRef.current = node.textarea;
              textareaRef.current.focus();
              const { length } = textareaRef.current.value;
              textareaRef.current.setSelectionRange(length, length);
            }
          }
        }}
        onChange={handleChange}
        onKeyDown={handleFieldKeyDown}
        onBlur={handleBlur}
        preview={commentMode}
        textareaProps={{
          placeholder,
          spellCheck: 'true',
        }}
        isGithubConnected={isGithubConnected}
        githubRepo={githubRepo}
        className={styles.editor}
      />
      <div className={gStyles.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} />
      </div>
    </Form>
  );
});

CommentEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCurrentUserUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommentEdit);
