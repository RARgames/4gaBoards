import React, { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { MDEditor } from '../Markdown';
import { MentionPopup, useMentions, createMentionPreviewPlugin } from '../Mention';
import MentionOverlay from '../MentionOverlay';

import * as s from './MentionMDEditor.module.scss';

const MentionMDEditor = React.forwardRef(({ value, mentionTriggers, onChange, onMentionChange, onKeyDown, className, ...restProps }, ref) => {
  const textareaRef = useRef(null);

  const {
    mentions,
    onTextChange,
    onKeyDown: handleKeyDown,
    onPaste: handlePaste,
    popup,
  } = useMentions({
    value,
    triggers: mentionTriggers,
    textareaRef,
    onChange,
    onMentionChange,
    onKeyDown,
    allowDuplicates: true,
  });

  const handleKeyDownCapture = useCallback(
    (e) => {
      handleKeyDown(e);
      if (e.defaultPrevented) {
        e.stopPropagation(); // Stop MDEditor from handling the event if handled by MentionMDEditor
      }
    },
    [handleKeyDown],
  );

  const extraRehypePlugins = useMemo(() => [createMentionPreviewPlugin(mentionTriggers)], [mentionTriggers]);
  const [textarea, setTextarea] = useState(null);
  const overlayContainer = textarea && textarea.isConnected ? textarea.parentElement : null;

  return (
    <>
      <MDEditor
        {...restProps} // eslint-disable-line react/jsx-props-no-spreading
        // Not memoized on purpose: ref callbacks rely on being rerun every render
        ref={(node) => {
          if (!node) return;
          if (node.textarea) {
            textareaRef.current = node.textarea;
            setTextarea(node.textarea);
          }
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node; // eslint-disable-line no-param-reassign
        }}
        value={value}
        extraRehypePlugins={extraRehypePlugins}
        className={clsx(className, s.editor)}
        onChange={onTextChange}
        onKeyDownCapture={handleKeyDownCapture}
        onPasteCapture={handlePaste}
      />
      {mentions.length > 0 && overlayContainer && <MentionOverlay textareaRef={textareaRef} value={value} mentions={mentions} container={overlayContainer} />}
      <MentionPopup popup={popup} />
    </>
  );
});

MentionMDEditor.propTypes = {
  value: PropTypes.string,
  mentionTriggers: PropTypes.arrayOf(
    PropTypes.shape({
      trigger: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      suggestions: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          avatarUrl: PropTypes.string,
          color: PropTypes.string,
        }),
      ).isRequired,
    }),
  ),
  onChange: PropTypes.func,
  onMentionChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
};

MentionMDEditor.defaultProps = {
  value: '',
  mentionTriggers: [],
  onChange: () => {},
  onMentionChange: undefined,
  onKeyDown: undefined,
  className: undefined,
};

export default React.memo(MentionMDEditor);
