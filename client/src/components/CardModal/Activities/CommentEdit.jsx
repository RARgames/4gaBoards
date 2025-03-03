import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle, Form, MDEditor } from '../../Utils';

import * as gs from '../../../globalStyles.module.scss';
import * as s from './CommentEdit.module.scss';

const CommentEdit = React.forwardRef(({ children, defaultData, placeholder, commentMode, isGithubConnected, githubRepo, onUpdate, onCurrentUserPrefsUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [data, handleFieldChange, setData] = useForm(null);
  const textareaRef = useRef(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setData({
      text: '',
      ...defaultData,
    });
  }, [defaultData, setData]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, [setData]);

  const focus = useCallback(() => {
    if (!textareaRef.current) return;

    textareaRef.current.focus();
    const { length } = textareaRef.current.value;
    textareaRef.current.setSelectionRange(length, length);
  }, []);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      focus();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    close();
  }, [data, defaultData, close, focus, onUpdate]);

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
      if (event.relatedTarget && event.relatedTarget.closest(`.${s.editor}`)) {
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
        onCurrentUserPrefsUpdate({ commentMode: preview });
      }, 0);
      return () => clearTimeout(timeout);
    },
    [onCurrentUserPrefsUpdate],
  );

  useEffect(() => {
    if (!isOpen) {
      setWasOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return children;
  }

  return (
    <Form>
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
              focus();
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
        className={s.editor}
      />
      <div className={gs.controls}>
        <Button style={ButtonStyle.Cancel} content={t('action.cancel')} onClick={handleCancel} />
        <Button style={ButtonStyle.Submit} content={t('action.save')} onClick={handleSubmit} />
      </div>
    </Form>
  );
});

CommentEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCurrentUserPrefsUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommentEdit);
