import React, { useCallback } from 'react';
import MarkdownEditor, { commands, selectWord, executeCommand } from '@uiw/react-md-editor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import remarkGithub from 'remark-github';

import { PreferredFonts } from '../../../constants/Enums';
import { Icon, IconType, IconSize } from '../Icon';
import MDSettings from './MDSettings';

import * as s from './MD.module.scss';

const MDEditor = React.forwardRef(({ isGithubConnected, githubRepo, preferredDetailsFont, className, ...props }, ref) => {
  const remarkPlugins = isGithubConnected ? [[remarkGithub, { repository: githubRepo }]] : null;
  const { rehypePlugins, colorNames } = MDSettings;
  const isMonospaceSelected = preferredDetailsFont === PreferredFonts.MONOSPACE;

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
    <MarkdownEditor
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
      previewOptions={{
        remarkPlugins,
        rehypePlugins,
      }}
      autoFocusEnd
      commands={[
        ...commands.getCommands(),
        commands.divider,
        commands.issue,
        commands.group(
          colorNames.map((color) => coloredText(color)),
          {
            name: 'color',
            groupName: 'color',
            buttonProps: { 'aria-label': 'Add colored text', title: 'Add colored text', className: s.coloredTextButton },
            icon: <Icon type={IconType.FillDrip} size={IconSize.Size13} />,
          },
        ),
      ]}
      className={classNames(className, s.editor, isMonospaceSelected && s.fontMonospace)}
      // TODO add mention
      // TODO add full functionality to mention and issue
    />
  );
});

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

MDEditor.propTypes = {
  isGithubConnected: PropTypes.bool,
  githubRepo: PropTypes.string,
  preferredDetailsFont: PropTypes.string.isRequired,
  className: PropTypes.string,
};

MDEditor.defaultProps = {
  isGithubConnected: false,
  githubRepo: '',
  className: undefined,
};

export default React.memo(MDEditor);
