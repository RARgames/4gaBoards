import React, { useCallback, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { useLocalStorage } from '../../hooks';
import { Button, ButtonVariant, MentionMDEditor } from '../Utils';
import { useEditorRef, useMentionTriggers, useMentionValue, getAddedMentions } from '../Utils/Mention';

import * as gs from '../../global.module.scss';
import * as s from './DescriptionEdit.module.scss';

const DescriptionEdit = React.forwardRef(
  (
    {
      defaultValue,
      cardId,
      descriptionHeight,
      descriptionMode,
      isGithubConnected,
      githubRepo,
      preferredDetailsFont,
      boardLabels,
      boardMemberships,
      onUpdate,
      onUserPrefsUpdate,
      onLocalDescChange,
      onMention,
      onClose,
    },
    ref,
  ) => {
    const [t] = useTranslation();
    const [value, , handleValueChange, resetValue] = useMentionValue();
    const [setLocalValue, getLocalValue] = useLocalStorage(`desc-${cardId}`);

    const handleModeChange = useCallback((preview) => onUserPrefsUpdate({ descriptionMode: preview }), [onUserPrefsUpdate]);
    const [textareaRef, setEditorRef] = useEditorRef(descriptionMode, handleModeChange);
    const mentionTriggers = useMentionTriggers({ memberships: boardMemberships, labels: boardLabels });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => textareaRef.current?.focus(),
      }),
      [textareaRef],
    );

    const discard = useCallback(() => {
      setLocalValue(null);
      onClose();
    }, [onClose, setLocalValue]);

    useEffect(() => {
      resetValue(getLocalValue() || defaultValue || '');
    }, [cardId, defaultValue, getLocalValue, resetValue]);

    const handleSubmit = useCallback(() => {
      const cleanValue = value.trim() || null;
      if (cleanValue !== defaultValue) {
        const addedMentions = getAddedMentions(defaultValue, cleanValue, mentionTriggers);
        onUpdate(cleanValue);

        addedMentions.filter((mention) => mention.type === 'users').forEach((mention) => onMention(mention.id));
      }
      discard();
    }, [value, defaultValue, onUpdate, onMention, mentionTriggers, discard]);

    const handleBlur = useCallback(
      (e) => {
        if (e.relatedTarget && e.relatedTarget.closest(`.${s.editor}`)) {
          return;
        }

        const cleanValue = value.trim() || null;
        if (cleanValue === defaultValue) {
          discard();
        } else if (cleanValue !== getLocalValue()) {
          setLocalValue(cleanValue);
        }
      },
      [value, getLocalValue, defaultValue, setLocalValue, discard],
    );

    const handleChange = useCallback(
      (newValue, newSubmitData) => {
        handleValueChange(newValue, newSubmitData);
        const cleanValue = (newValue || '').trim() || null;
        onLocalDescChange(cleanValue !== defaultValue);
      },
      [handleValueChange, defaultValue, onLocalDescChange],
    );

    const handleEditorKeyDown = useCallback(
      (e) => {
        if (e.key === 'Escape') {
          discard();
        } else if (e.ctrlKey && e.key === 'Enter') {
          handleSubmit();
        }
      },
      [discard, handleSubmit],
    );

    return (
      <>
        <MentionMDEditor
          value={value}
          ref={setEditorRef}
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
          preferredDetailsFont={preferredDetailsFont}
          mentionTriggers={mentionTriggers}
          className={s.editor}
        />
        <div className={gs.controls}>
          <Button variant={ButtonVariant.Cancel} content={t('common.cancel')} onClick={discard} />
          <Button variant={ButtonVariant.Submit} content={t('common.save')} onClick={handleSubmit} />
        </div>
      </>
    );
  },
);

DescriptionEdit.propTypes = {
  defaultValue: PropTypes.string,
  cardId: PropTypes.string.isRequired,
  descriptionHeight: PropTypes.number.isRequired,
  descriptionMode: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  boardLabels: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  boardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
  onLocalDescChange: PropTypes.func.isRequired,
  onMention: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
};

export default React.memo(DescriptionEdit);
