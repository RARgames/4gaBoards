import React, { useCallback, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';

import { MentionPopup, useMentions } from '../Mention';
import MentionOverlay from '../MentionOverlay';
import { TextArea } from '../TextArea';

import * as s from './MentionTextArea.module.scss';

const MentionTextArea = React.forwardRef(({ value, mentionTriggers, onChange, onMentionChange, onKeyDown, className, ...restProps }, ref) => {
  const textareaRef = useRef(null);

  useImperativeHandle(ref, () => textareaRef.current, []);

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
  });

  const handleChange = useCallback((e) => onTextChange(e.target.value), [onTextChange]);

  return (
    <div className={s.wrapper}>
      <div className={s.field}>
        <TextArea
          {...restProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={textareaRef}
          value={value}
          className={className}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPasteCapture={handlePaste}
        />
        {mentions.length > 0 && <MentionOverlay textareaRef={textareaRef} value={value} mentions={mentions} />}
      </div>
      <MentionPopup popup={popup} />
    </div>
  );
});

MentionTextArea.propTypes = {
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

MentionTextArea.defaultProps = {
  value: '',
  mentionTriggers: [],
  onChange: () => {},
  onMentionChange: undefined,
  onKeyDown: undefined,
  className: undefined,
};

export default React.memo(MentionTextArea);
