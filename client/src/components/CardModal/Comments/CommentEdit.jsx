import React, { useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import { useForm } from '../../../hooks';
import { Button, ButtonStyle, Form, MDEditor } from '../../Utils';

import * as gs from '../../../global.module.scss';
import * as s from './CommentEdit.module.scss';

const CommentEdit = React.forwardRef(({ children, defaultData, placeholder, commentMode, isGithubConnected, githubRepo, preferredDetailsFont, onUpdate, onUserPrefsUpdate }, ref) => {
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

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textareaRef.current?.focus();
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
    (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        submit();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  const handleChange = useCallback(
    (value) => {
      const e = { target: { name: 'text', value } };
      handleFieldChange(e);
    },
    [handleFieldChange],
  );

  const handleBlur = useCallback(
    (e) => {
      if (e.relatedTarget && e.relatedTarget.closest(`.${s.editor}`)) {
        return;
      }

      if (e.target.value.trim() === defaultData.text.trim()) {
        handleCancel();
      }
    },
    [defaultData.text, handleCancel],
  );

  const handlePreviewUpdate = useCallback(
    (preview) => {
      onUserPrefsUpdate({ commentMode: preview });
    },
    [onUserPrefsUpdate],
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
        preferredDetailsFont={preferredDetailsFont}
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
  preferredDetailsFont: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommentEdit);
