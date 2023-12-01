import React, { useCallback, useImperativeHandle, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'semantic-ui-react';
import MDEditor, { commands, selectWord, executeCommand } from '@uiw/react-md-editor';
import { faFillDrip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocalStorage } from '../../hooks';

// eslint-disable-next-line no-unused-vars
import styles from './DescriptionEdit.module.scss';
import gStyles from '../../globalStyles.module.scss';

// eslint-disable-next-line no-unused-vars
const DescriptionEdit = React.forwardRef(
  ({ defaultValue, onUpdate, cardId, descriptionHeight, availableColors, descriptionMode, isGithubConnected, githubRepo, rehypePlugins, remarkPlugins, onLocalDescChange, onClose }, ref) => {
    const [t] = useTranslation();
    const [value, setValue] = useState(undefined);
    const textareaRef = useRef(null);
    const [setLocalValue, getLocalValue] = useLocalStorage(`desc-${cardId}`);

    const setLocalDescription = useCallback(
      (desc) => {
        setLocalValue(desc);
      },
      [setLocalValue],
    );

    // eslint-disable-next-line consistent-return
    const focus = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      } else {
        const timeout = setTimeout(() => {
          textareaRef.current?.focus();
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
      const cleanValue = value.trim() || null;
      if (cleanValue !== getLocalValue()) {
        if (cleanValue !== defaultValue) {
          setLocalDescription(cleanValue);
        } else {
          setLocalDescription(null);
        }
      }
    }, [value, getLocalValue, defaultValue, setLocalDescription]);

    const handleChange = useCallback(
      (newValue) => {
        setValue(newValue);
        const cleanValue = newValue.trim() || null;
        onLocalDescChange(cleanValue !== getLocalValue() && cleanValue !== defaultValue);
      },
      [defaultValue, getLocalValue, onLocalDescChange],
    );

    const handleEditorKeyDown = useCallback(
      (event) => {
        if (event.key === 'Escape') {
          handleCancel();
        } else if (event.ctrlKey && event.key === 'Enter') {
          handleSubmit();
        }
      },
      [handleCancel, handleSubmit],
    );

    useEffect(() => {
      open();
      return () => {
        close(false);
      };
    }, [close, open]);

    const coloredText = useCallback((color) => {
      return {
        name: `${color}Color`,
        keyCommand: `${color}Color`,
        prefix: `<!--${color}-->`,
        suffix: `<!--${color}-end-->`,
        buttonProps: { 'aria-label': `Add ${color} text`, title: `Add ${color} text` },
        icon: <div style={{ fontSize: 14, textAlign: 'left', color }}>{color}</div>,
        execute: (state, api) => {
          const newSelectionRange = selectWord({
            text: state.text,
            selection: state.selection,
            prefix: state.command.prefix,
            suffix: state.command.suffix,
          });
          const state1 = api.setSelectionRange(newSelectionRange);
          executeCommand({
            api,
            selectedText: state1.selectedText,
            selection: state.selection,
            prefix: state.command.prefix,
            suffix: state.command.suffix,
          });
        },
      };
    }, []);

    return (
      <>
        <MDEditor
          value={value}
          ref={(node) => {
            if (node && node.textarea) {
              textareaRef.current = node.textarea;
            }
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          height={Math.min(Math.max(descriptionHeight + 0.31 * descriptionHeight, 200), 650)}
          onKeyDown={handleEditorKeyDown}
          preview={descriptionMode}
          textareaProps={{
            placeholder: t('common.enterDescription'),
            spellCheck: 'true',
          }}
          previewOptions={{
            remarkPlugins,
            rehypePlugins,
          }}
          commands={[
            ...commands.getCommands(),
            commands.divider,
            commands.issue,
            commands.group(
              availableColors.map((color) => coloredText(color)),
              {
                name: 'color',
                groupName: 'color',
                buttonProps: { 'aria-label': 'Add colored text', title: 'Add colored text' },
                icon: <FontAwesomeIcon icon={faFillDrip} width="13" height="13" />,
              },
            ),
          ]}
          // TODO add mention
          // TODO add full functionality to mention and issue
        />
        <div className={gStyles.controls}>
          <Button negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} />
          <Button positive content={t('action.save')} className={gStyles.submitButton} onClick={handleSubmit} />
        </div>
      </>
    );
  },
);

// const focusCommand = {
//   name: 'unordered-list',
//   keyCommand: 'list',
//   shortcuts: 'ctrl+shift+u',
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
  descriptionHeight: PropTypes.number.isRequired,
  availableColors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  descriptionMode: PropTypes.string.isRequired,
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
