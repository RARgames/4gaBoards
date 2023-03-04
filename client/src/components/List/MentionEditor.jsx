import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Editor from '@draft-js-plugins/editor';
import { defaultSuggestionsFilter } from '@draft-js-plugins/mention';

// Mentions
import mentions from './mentions';

// CSS
import '@draft-js-plugins/mention/lib/plugin.css';
import styles from './CardAdd.module.scss';

function MentionEditor({ editorRef, editorState, setEditorState, plugins, suggestions, setSuggestions, MentionSuggestions, onBlur, handleFieldKeyDown, keyBindingFn }) {
  const [open, setOpen] = useState(false);

  const onOpenChange = (_open) => {
    setOpen(_open);
  };

  const onSearchChange = ({ trigger, value }) => {
    setSuggestions(defaultSuggestionsFilter(value, mentions, trigger));
  };

  const handleAddMention = (currMention) => {
    console.log('Mention Add Event', currMention);
  };

  return (
    <div className={styles.fieldWrapper}>
      <Editor ref={editorRef} spellCheck keyBindingFn={keyBindingFn} handleKeyCommand={handleFieldKeyDown} editorState={editorState} onChange={setEditorState} plugins={plugins} onBlur={onBlur} />
      <MentionSuggestions open={open} onOpenChange={onOpenChange} suggestions={suggestions} onSearchChange={onSearchChange} onAddMention={handleAddMention} />
    </div>
  );
}

MentionEditor.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  editorRef: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  editorState: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  plugins: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  suggestions: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  setEditorState: PropTypes.func.isRequired, // eslint-disable-next-line react/forbid-prop-types
  MentionSuggestions: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  setSuggestions: PropTypes.any.isRequired, // eslint-disable-next-line react/forbid-prop-types
  onBlur: PropTypes.func.isRequired,
  handleFieldKeyDown: PropTypes.func.isRequired,
  keyBindingFn: PropTypes.func.isRequired,
};

export default MentionEditor;
