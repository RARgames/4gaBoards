import React from 'react';
import PropTypes from 'prop-types';
import Editor from '@draft-js-plugins/editor';

import EntryComponent from './EntryComponent';

// Mentions
import mentions from './mentions';

// CSS
import '@draft-js-plugins/mention/lib/plugin.css';
import styles from '../List/CardAdd.module.scss';
import './styles.css';

function MentionEditor({ editorRef, editorState, setEditorState, plugins, suggestions, setSuggestions, MentionSuggestions, onBlur, handleFieldKeyDown, keyBindingFn, open, setOpen }) {
  const onOpenChange = (_open) => {
    setOpen(_open);
  };

  const customSuggestionsFilter = (value, mentionsList, trigger) => {
    const filteredSuggestions = mentionsList[trigger].filter((suggestion) => suggestion.name.toLowerCase().startsWith(value.toLowerCase()));
    return filteredSuggestions;
  };

  const onSearchChange = ({ trigger, value }) => {
    if (value.length > 0) {
      setSuggestions(customSuggestionsFilter(value, mentions, trigger));
    } else {
      setSuggestions([]);
    }
  };

  const handleAddMention = (mention) => {};

  return (
    <div className={styles.fieldWrapper}>
      <Editor ref={editorRef} spellCheck keyBindingFn={keyBindingFn} handleKeyCommand={handleFieldKeyDown} editorState={editorState} onChange={setEditorState} plugins={plugins} onBlur={onBlur} />
      <MentionSuggestions entryComponent={EntryComponent} open={open} onOpenChange={onOpenChange} suggestions={suggestions} onSearchChange={onSearchChange} onAddMention={handleAddMention} />
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
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

export default MentionEditor;
