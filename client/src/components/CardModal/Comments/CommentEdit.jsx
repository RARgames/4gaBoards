import React, { useCallback, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { dequal } from 'dequal';
import PropTypes from 'prop-types';

import { Button, ButtonVariant, Form, MentionMDEditor } from '../../Utils';
import { useEditorRef, useMentionTriggers, useMentionValue, getAddedMentions } from '../../Utils/Mention';

import * as gs from '../../../global.module.scss';
import * as s from './CommentEdit.module.scss';

const CommentEdit = React.forwardRef(
  ({ children, defaultData, placeholder, commentMode, isGithubConnected, githubRepo, preferredDetailsFont, boardMemberships, boardLabels, onUpdate, onMention, onUserPrefsUpdate }, ref) => {
    const [t] = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [text, , handleChange, resetText] = useMentionValue();

    const handleModeChange = useCallback((preview) => onUserPrefsUpdate({ commentMode: preview }), [onUserPrefsUpdate]);
    const [textareaRef, setEditorRef] = useEditorRef(commentMode, handleModeChange);
    const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels });

    const open = useCallback(() => {
      setIsOpen(true);
      resetText(defaultData.text || '');
    }, [defaultData, resetText]);

    const close = useCallback(() => {
      setIsOpen(false);
      resetText();
    }, [resetText]);

    const submit = useCallback(() => {
      const cleanData = { ...defaultData, text: text.trim() };

      if (!cleanData.text) {
        textareaRef.current?.focus();
        return;
      }

      if (!dequal(cleanData, defaultData)) {
        const mentionedUserIds = getAddedMentions(defaultData.text, cleanData.text, mentionTriggers)
          .filter((mention) => mention.type === 'users')
          .map((mention) => mention.id);
        onUpdate(cleanData);
        mentionedUserIds.forEach((userId) => onMention(userId, cleanData.text));
      }

      close();
    }, [defaultData, text, close, textareaRef, mentionTriggers, onUpdate, onMention]);

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
          close();
        }
      },
      [close, submit],
    );

    const handleBlur = useCallback(
      (e) => {
        if (e.relatedTarget && e.relatedTarget.closest(`.${s.editor}`)) {
          return;
        }

        if (e.target.value.trim() === defaultData.text.trim()) {
          close();
        }
      },
      [defaultData.text, close],
    );

    if (!isOpen) {
      return children;
    }

    return (
      <Form>
        <MentionMDEditor
          name="text"
          value={text}
          ref={setEditorRef}
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
          mentionTriggers={mentionTriggers}
          className={s.editor}
        />
        <div className={gs.controls}>
          <Button variant={ButtonVariant.Cancel} content={t('common.cancel')} onClick={close} />
          <Button variant={ButtonVariant.Submit} content={t('common.save')} onClick={submit} />
        </div>
      </Form>
    );
  },
);

CommentEdit.propTypes = {
  children: PropTypes.node.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  placeholder: PropTypes.string.isRequired,
  commentMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onMention: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommentEdit);
