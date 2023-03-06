import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Form } from 'semantic-ui-react';

// For MentionEditor component
import { EditorState, ContentState, KeyBindingUtil } from 'draft-js';

import createMentionPlugin from '@draft-js-plugins/mention';
import { getTextWithPrefix, getTextWithoutPrefix, getMentionsData } from '../MentionEditor/draftjs-utils';
import MentionEditor from '../MentionEditor/MentionEditor';
import mentions from '../MentionEditor/mentions';
//
import { useDidUpdate, useToggle } from '../../lib/hooks';

import { useClosableForm, useForm } from '../../hooks';

import styles from './CardAdd.module.scss';
import gStyles from '../../globalStyles.module.scss';
import MentionComponent from '../MentionEditor/MentionComponent';

const { hasCommandModifier } = KeyBindingUtil;

const DEFAULT_DATA = {
  name: '',
};

const CardAdd = React.memo(({ isOpened, onCreate, onClose, labelIds, memberIds }) => {
  const [t] = useTranslation();
  const [data, handleFieldChange, setData] = useForm(DEFAULT_DATA);
  const [focusNameFieldState, focusNameField] = useToggle();
  /** **************** Mentions using DraftJS Editor and DraftJS Mentions plugin ************* */
  // Each editor needs to have its own editor state and custom mentions plugins
  const nameField = useRef(null);
  const [open, setOpen] = useState(false);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [suggestions, setSuggestions] = useState(mentions['#']);

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin({
      theme: {
        mentionSuggestionsPopup: 'suggestionPopup',
        mentionSuggestionsEntry: 'entryComponentContainer',
      },
      mentionComponent: MentionComponent,
      mentionTrigger: ['@', '#'],
      supportWhitespace: true,
      popperOptions: {
        strategy: 'fixed',
        placement: 'bottom-start',
      },
    });
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  // Add member mentions
  // Simply uncomment these two functions and suggestions will be populated with labelIds and userIds
  const memberMentions = memberIds.map((member) => {
    const memberData = {};
    memberData.id = member.user.id;
    memberData.name = member.user.name;
    memberData.username = member.user.username;
    // memberData.avatar = member.user.avatarUrl;
    memberData.avatar = 'https://avatars0.githubusercontent.com/u/2182307?v=3&s=400';
    memberData.prefix = '@';
    return memberData;
  });

  mentions['@'] = memberMentions;

  // Add label mentions
  const labelMentions = labelIds.map((label) => {
    const labelData = {};
    labelData.id = label.id;
    labelData.name = label.name;
    labelData.prefix = '#';
    labelData.color = label.color;
    return labelData;
  });

  mentions['#'] = labelMentions;

  // Helper methods
  const clearEditor = useCallback(() => {
    const emptyContentState = ContentState.createFromText('');
    const newEditorState = EditorState.push(editorState, emptyContentState, clearEditor, 'remove-range');
    const updatedEditorState = EditorState.moveFocusToEnd(newEditorState);
    setEditorState(updatedEditorState);
  }, [editorState]);

  /** **************** Mentions End ************* */

  const close = useCallback(() => {
    setData(DEFAULT_DATA);
    clearEditor();
    onClose();
  }, [clearEditor, onClose, setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close, editorState);

  const submit = useCallback(
    (autoOpen) => {
      const mentionsData = getMentionsData(editorState);

      const cleanData = {
        ...data,
        name: getTextWithPrefix(editorState).trim(),
        labelIds: mentionsData.labels,
        userIds: mentionsData.users,
        raw: getTextWithoutPrefix(editorState),
      };

      console.log('cleanData', cleanData);

      if (!cleanData.name) {
        setData(DEFAULT_DATA);
        clearEditor();
        return;
      }

      onCreate(cleanData, autoOpen);
      setData(DEFAULT_DATA);
      handleClearModified();
      clearEditor();

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [data, editorState, onCreate, setData, handleClearModified, clearEditor, onClose, focusNameField],
  );

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    setData(DEFAULT_DATA);
    handleClearModified();
    clearEditor();
    onClose();
  }, [clearEditor, handleClearModified, onClose, setData]);
  /** ***************** Handle Key Down events ********************* */
  const myKeyBindingFn = (e) => {
    if (e.keyCode === 13 && hasCommandModifier(e)) {
      return 'addCard-and-open';
    }
    if (e.keyCode === 13) {
      return 'addCard';
    }
    if (e.keyCode === 27) {
      return 'cancel';
    }
  };

  const handleFieldKeyDown = useCallback(
    (command) => {
      if (command === 'addCard-and-open') {
        submit(true);
      }
      if (command === 'addCard') {
        submit(false);
      }
      if (command === 'cancel') {
        if (open) {
          setOpen(false);
          return;
        }

        handleCancel();
      }
    },
    [handleCancel, open, submit],
  );
  /** ****************************Handle Key Down events end*********************************** */
  useEffect(() => {
    if (isOpened) {
      nameField.current.focus();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    nameField.current.focus();
  }, [focusNameFieldState]);

  return (
    <Form className={classNames(styles.wrapper, !isOpened && styles.wrapperClosed)} onSubmit={handleSubmit}>
      <MentionEditor
        open={open}
        setOpen={setOpen}
        onBlur={handleFieldBlur}
        editorRef={nameField}
        editorState={editorState}
        setEditorState={setEditorState}
        MentionSuggestions={MentionSuggestions}
        suggestions={suggestions}
        setSuggestions={setSuggestions}
        plugins={plugins}
        handleFieldKeyDown={handleFieldKeyDown}
        keyBindingFn={myKeyBindingFn}
      />
      <div className={gStyles.controls}>
        <Button type="button" negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button positive content={t('action.addCard')} className={gStyles.submitButton} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

CardAdd.propTypes = {
  isOpened: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired,
};

export default CardAdd;
