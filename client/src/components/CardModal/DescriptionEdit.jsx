import React, { useCallback, useImperativeHandle, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import MDEditor, { commands } from '@uiw/react-md-editor';
// import { selectWord, getBreaksNeededForEmptyLineBefore, getBreaksNeededForEmptyLineAfter } from '@uiw/react-md-editor/lib/utils/markdownUtils';
import { useLocalStorage } from '../../hooks';

// eslint-disable-next-line no-unused-vars
import styles from './DescriptionEdit.module.scss';
import gStyles from '../../globalStyles.module.scss';

// eslint-disable-next-line no-unused-vars
const DescriptionEdit = React.forwardRef(({ defaultValue, onUpdate, cardId, isGithubConnected, githubRepo, rehypePlugins, remarkPlugins, onLocalDescChange, onClose }, ref) => {
  const [t] = useTranslation();
  const [value, setValue] = useState(undefined);
  const textareaRef = useRef(null);
  const [setLocalValue, getLocalValue] = useLocalStorage(`desc-${cardId}`);

  const setLocalDescription = useCallback(
    (desc) => {
      setLocalValue(desc);
      onLocalDescChange(desc);
    },
    [onLocalDescChange, setLocalValue],
  );

  // eslint-disable-next-line consistent-return
  const focus = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    } else {
      const timeout = setTimeout(() => {
        textareaRef.current.focus();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, []);

  const open = useCallback(() => {
    setValue(getLocalValue() || defaultValue || '');
    const timeout = setTimeout(() => {
      focus();
    }, 0);

    return () => clearTimeout(timeout);
  }, [defaultValue, focus, getLocalValue]);

  const close = useCallback(
    (removeLocalDesc = false) => {
      if (removeLocalDesc) {
        setLocalDescription(null);
        onClose();
      }
    },
    [onClose, setLocalDescription],
  );

  useImperativeHandle(
    ref,
    () => ({
      focus,
    }),
    [focus],
  );

  const isChanged = useCallback(() => {
    const cleanValue = value.trim() || null;
    return cleanValue !== defaultValue;
  }, [defaultValue, value]);

  const handleSubmit = useCallback(() => {
    const cleanValue = value.trim() || null;
    if (cleanValue !== defaultValue) {
      onUpdate(cleanValue);
    }
    setValue(null);
    close(true);
  }, [defaultValue, onUpdate, value, close]);

  const handleCancel = useCallback(() => {
    setValue(null);
    close(true);
  }, [close]);

  const handleBlur = useCallback(() => {
    if (!isChanged()) {
      setLocalDescription(null);
      handleCancel();
    } else if (value) {
      const cleanValue = value.trim() || null;
      if (cleanValue !== getLocalValue()) {
        setLocalDescription(cleanValue);
      }
    }
  }, [isChanged, value, handleCancel, getLocalValue, setLocalDescription]);

  const getLinePos = useCallback((text, lineNumber) => {
    const lines = text.split('\n');
    if (lineNumber < lines.length) {
      let startPos = 0;
      for (let i = 0; i < lineNumber; i += 1) {
        startPos += lines[i].length + 1;
      }
      const endPos = startPos + lines[lineNumber].length;
      return { startPos, endPos };
    }
    return { startPos: -1, endPos: -1 };
  }, []);

  const handleBlockSelection = useCallback(
    (text, startLine, endLine) => {
      textareaRef.current.setSelectionRange(getLinePos(text, startLine).startPos, getLinePos(text, endLine).endPos);
    },
    [getLinePos],
  );

  const handleLineMove = useCallback(
    (direction) => {
      const textarea = textareaRef.current;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;

      const textBeforeStartPos = value.slice(0, startPos);
      const textBeforeEndPos = value.slice(0, endPos);

      const lines = value.split('\n');
      const blockStartLine = textBeforeStartPos.split('\n').length - 1;
      const blockEndLine = textBeforeEndPos.split('\n').length - 1;

      if ((direction < 0 && blockStartLine === 0) || (direction > 0 && blockEndLine === lines.length - 1)) {
        return;
      }
      const blockStartPos = getLinePos(value, blockStartLine).startPos;
      const blockEndPos = getLinePos(value, blockEndLine).endPos;

      const blockText = value.slice(blockStartPos, blockEndPos);
      if (direction < 0) {
        const prevLine = textBeforeStartPos.split('\n').length - 2;
        const prevLineStartPos = getLinePos(value, prevLine).startPos;
        const prevLineText = lines[prevLine];

        textarea.setSelectionRange(prevLineStartPos, blockEndPos);
        const isSuccess = document.execCommand && document.execCommand('insertText', false, `${blockText}\n${prevLineText}`);
        if (!isSuccess) {
          // Fallback on some browsers
          const updatedText = `${value.slice(0, prevLineStartPos)}${blockText}\n${prevLineText}${value.slice(blockEndPos)}`;
          setValue(updatedText);
        }
        setTimeout(() => {
          handleBlockSelection(textarea.value, blockStartLine - 1, blockEndLine - 1);
        }, 0);
      } else {
        const nextLine = textBeforeEndPos.split('\n').length;
        const nextLineEndPos = getLinePos(value, nextLine).endPos;
        const nextLineText = lines[nextLine];

        textarea.setSelectionRange(blockStartPos, nextLineEndPos);
        const isSuccess = document.execCommand && document.execCommand('insertText', false, `${nextLineText}\n${blockText}`);
        if (!isSuccess) {
          // Fallback on some browsers
          const updatedText = `${value.slice(0, blockStartPos)}${nextLineText}\n${blockText}${value.slice(nextLineEndPos)}`;
          setValue(updatedText);
        }
        setTimeout(() => {
          handleBlockSelection(textarea.value, blockStartLine + 1, blockEndLine + 1);
        }, 0);
      }
    },
    [getLinePos, handleBlockSelection, value],
  );

  const handleEditorKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.ctrlKey && event.key === 'Enter') {
        handleSubmit();
      } else if (event.altKey && event.key === 'ArrowUp') {
        handleLineMove(-1);
      } else if (event.altKey && event.key === 'ArrowDown') {
        handleLineMove(1);
      }
    },
    [handleCancel, handleLineMove, handleSubmit],
  );

  useEffect(() => {
    open();
    return () => {
      close(false);
    };
  }, [close, open]);

  const help = {
    name: 'help',
    keyCommand: 'help',
    buttonProps: { 'aria-label': 'Open help', title: 'Open help' },
    icon: (
      <svg viewBox="0 0 16 16" width="12px" height="12px">
        <path
          d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm.9 13H7v-1.8h1.9V13Zm-.1-3.6v.5H7.1v-.6c.2-2.1 2-1.9 1.9-3.2.1-.7-.3-1.1-1-1.1-.8 0-1.2.7-1.2 1.6H5c0-1.7 1.2-3 2.9-3 2.3 0 3 1.4 3 2.3.1 2.3-1.9 2-2.1 3.5Z"
          fill="currentColor"
        />
      </svg>
    ),
    execute: () => {
      window.open('https://www.markdownguide.org/basic-syntax/', '_blank', 'noreferrer');
    },
  };

  // const textAreaNode = useCallback(
  //   (props, dispatch, onChange, shortcuts, useContext) => (
  //     <textarea
  //       // eslint-disable-next-line react/jsx-props-no-spreading
  //       {...props}
  //       onKeyDown={(e) => {
  //         if (shortcuts && useContext) {
  //           // eslint-disable-next-line no-shadow, prefer-const
  //           const { commands, commandOrchestrator } = useContext;
  //           console.log(commands, commandOrchestrator, shortcuts);
  //           if (commands) {
  //             shortcuts(e, commands, commandOrchestrator);
  //           }
  //         }
  //       }}
  //       onChange={(e) => {
  //         if (onChange) onChange(e);
  //       }}
  //     />
  //   ),
  //   [],
  // );

  return (
    <>
      <MDEditor
        value={value}
        ref={(node) => {
          if (node && node.textarea) {
            textareaRef.current = node.textarea;
          }
        }}
        onChange={setValue}
        onBlur={handleBlur}
        height={400}
        maxHeight={650}
        onKeyDown={handleEditorKeyDown}
        preview="edit"
        textareaProps={{
          placeholder: t('common.enterDescription'),
          spellCheck: 'true',
        }}
        previewOptions={{
          linkTarget: '_blank',
          rehypePlugins,
          remarkPlugins,
        }}
        commands={[...commands.getCommands(), help]}
        // commands={[...commands.getCommands(), help, focusCommand]}
        // components={{
        //   textarea: (props, opts) => {
        //     const { dispatch, onChange, shortcuts, useContext } = opts;
        //     return textAreaNode(props, dispatch, onChange, shortcuts, useContext);
        //   },
        // }}
        // components={{
        //   // eslint-disable-next-line react/no-unstable-nested-components
        //   textarea: (props, opts) => {
        //     const { dispatch, onChange, useContext, shortcuts } = opts;
        //     return (
        //       <textarea
        //         // eslint-disable-next-line react/jsx-props-no-spreading
        //         {...props}
        //         onKeyDown={(e) => {
        //           if (shortcuts && useContext) {
        //             // eslint-disable-next-line no-shadow
        //             const { commands, commandOrchestrator } = useContext;
        //             if (commands) {
        //               shortcuts(e, commands, commandOrchestrator);
        //             }
        //           }
        //         }}
        //         onChange={(e) => {
        //           if (onChange) onChange(e);
        //         }}
        //       />
        //     );
        //   },
        // }}
      />
      <div className={gStyles.controls}>
        <Button negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} />
        <Button positive content={t('action.save')} className={gStyles.submitButton} onClick={handleSubmit} />
      </div>
    </>
  );
});

// function insertBeforeEachLine(selectedText, insertBefore) {
//   const lines = selectedText.split(/\n/);

//   let insertionLength = 0;
//   const modifiedText = lines
//     .map((item, index) => {
//       if (typeof insertBefore === 'string') {
//         insertionLength += insertBefore.length;
//         return insertBefore + item;
//       }
//       if (typeof insertBefore === 'function') {
//         const insertionResult = insertBefore(item, index);
//         insertionLength += insertionResult.length;
//         return insertBefore(item, index) + item;
//       }
//       throw Error('insertion is expected to be either a string or a function');
//     })
//     .join('\n');

//   return { modifiedText, insertionLength };
// }

// const makeList = (state, api, insertBefore) => {
//   // Adjust the selection to encompass the whole word if the caret is inside one
//   const newSelectionRange = selectWord({ text: state.text, selection: state.selection });
//   const state1 = api.setSelectionRange(newSelectionRange);

//   const breaksBeforeCount = getBreaksNeededForEmptyLineBefore(state1.text, state1.selection.start);
//   const breaksBefore = Array(breaksBeforeCount + 1).join('\n');

//   const breaksAfterCount = getBreaksNeededForEmptyLineAfter(state1.text, state1.selection.end);
//   const breaksAfter = Array(breaksAfterCount + 1).join('\n');

//   const modifiedText = insertBeforeEachLine(state1.selectedText, insertBefore);

//   api.replaceSelection(`${breaksBefore}${modifiedText.modifiedText}${breaksAfter}`);

//   // Specifically when the text has only one line, we can exclude the "- ", for example, from the selection
//   const oneLinerOffset = state1.selectedText.indexOf('\n') === -1 ? modifiedText.insertionLength : 0;

//   const selectionStart = state1.selection.start + breaksBeforeCount + oneLinerOffset;
//   const selectionEnd = selectionStart + modifiedText.modifiedText.length - oneLinerOffset;

//   // Adjust the selection to not contain the **
//   api.setSelectionRange({
//     start: selectionStart,
//     end: selectionEnd,
//   });
// };

// const focusCommand = {
//   name: 'unordered-list',
//   keyCommand: 'list',
//   shortcuts: 'ctrl+shift+u',
//   value: '- ',
//   buttonProps: {
//     'aria-label': 'Add unordered list (ctrl + shift + u)',
//     title: 'Add unordered list (ctrl + shift + u)',
//   },
//   icon: (
//     <svg data-name="unordered-list" width="12" height="12" viewBox="0 0 512 512">
//       <path
//         fill="currentColor"
//         d="M96 96c0 26.51-21.49 48-48 48S0 122.51 0 96s21.49-48 48-48 48 21.49 48 48zM48 208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm0 160c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm96-236h352c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H144c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h352c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H144c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h352c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H144c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"
//       />
//     </svg>
//   ),
//   execute: (state, api) => {
//     makeList(state, api, '- ');
//   },
// };

DescriptionEdit.propTypes = {
  defaultValue: PropTypes.string,
  onUpdate: PropTypes.func.isRequired,
  cardId: PropTypes.string.isRequired,
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  rehypePlugins: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  remarkPlugins: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  onLocalDescChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

DescriptionEdit.defaultProps = {
  defaultValue: undefined,
  remarkPlugins: null,
};

export default React.memo(DescriptionEdit);
