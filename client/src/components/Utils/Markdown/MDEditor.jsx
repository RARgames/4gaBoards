import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MarkdownEditor, { commands, selectWord, executeCommand } from '@uiw/react-md-editor/common';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import remarkGithub from 'remark-github';

import { PreferredFonts } from '../../../constants/Enums';
import { Icon, IconType, IconSize } from '../Icon';
import { createGithubBuildUrl } from '../Mention';
import MDSettings from './MDSettings';

import * as s from './MD.module.scss';

const MDEditor = React.forwardRef(({ isGithubConnected, githubRepo, preferredDetailsFont, extraRehypePlugins, className, ...props }, ref) => {
  const [t] = useTranslation();

  const remarkPlugins = isGithubConnected ? [[remarkGithub, { repository: githubRepo, buildUrl: createGithubBuildUrl(extraRehypePlugins) }]] : null;
  const { rehypePlugins, colorNames } = MDSettings;
  const mergedRehypePlugins = extraRehypePlugins ? [...rehypePlugins, ...extraRehypePlugins] : rehypePlugins;
  const isMonospaceSelected = preferredDetailsFont === PreferredFonts.MONOSPACE;

  const mdEditorCommands = useMemo(() => {
    const coloredText = (color) => ({
      name: `${color}Color`,
      keyCommand: `${color}Color`,
      prefix: `<!--${color}-->`,
      suffix: `<!--${color}-end-->`,
      buttonProps: {
        'aria-label': t('common.addColoredTextColor', { color }),
        title: t('common.addColoredTextColor', { color }),
      },
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
    });

    const colorsCommandsGroup = commands.group(
      colorNames.map((color) => coloredText(color)),
      {
        name: 'color',
        groupName: 'color',
        buttonProps: {
          'aria-label': t('common.addColoredText'),
          title: t('common.addColoredText'),
          className: s.coloredTextButton,
        },
        icon: <Icon type={IconType.FillDrip} size={IconSize.Size13} />,
      },
    );

    const userMentionCommand = {
      name: 'userMention',
      keyCommand: 'userMention',
      prefix: '@',
      buttonProps: {
        'aria-label': t('common.addUserMention'),
        title: t('common.addUserMention'),
        className: s.coloredTextButton,
      },
      icon: <Icon type={IconType.At} size={IconSize.Size13} />,
      execute: (state, api) => {
        const newSelectionRange = selectWord({
          text: state.text,
          selection: state.selection,
          prefix: '@',
        });
        const state1 = api.setSelectionRange(newSelectionRange);
        executeCommand({
          api,
          selectedText: state1.selectedText,
          selection: state.selection,
          prefix: '@',
          suffix: '',
        });
      },
    };

    const dateMentionCommand = {
      name: 'date',
      keyCommand: 'date',
      prefix: '!',
      buttonProps: {
        'aria-label': t('common.addDateMention'),
        title: t('common.addDateMention'),
        className: s.coloredTextButton,
      },
      icon: <Icon type={IconType.Calendar} size={IconSize.Size14} />,
      execute: (state, api) => {
        const newSelectionRange = selectWord({
          text: state.text,
          selection: state.selection,
          prefix: '!',
        });
        const state1 = api.setSelectionRange(newSelectionRange);
        executeCommand({
          api,
          selectedText: state1.selectedText,
          selection: state.selection,
          prefix: '!',
          suffix: '',
        });
      },
    };

    const issueLabel = isGithubConnected ? t('common.addLabelOrIssueMention') : t('common.addLabelMention');
    const issueMentionCommand = {
      ...commands.issue,
      buttonProps: {
        ...commands.issue.buttonProps,
        'aria-label': issueLabel,
        title: issueLabel,
      },
    };

    const defaultCommands = commands.getCommands().filter((cmd) => cmd.keyCommand !== 'help');

    return [...defaultCommands.slice(0, 5), colorsCommandsGroup, ...defaultCommands.slice(5), userMentionCommand, issueMentionCommand, dateMentionCommand, commands.divider, commands.help];
  }, [t, isGithubConnected, colorNames]);

  return (
    <MarkdownEditor
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
      previewOptions={{
        remarkPlugins,
        rehypePlugins: mergedRehypePlugins,
      }}
      autoFocusEnd
      commands={mdEditorCommands}
      className={clsx(className, s.editor, isMonospaceSelected && s.fontMonospace)}
    />
  );
});

MDEditor.propTypes = {
  isGithubConnected: PropTypes.bool,
  githubRepo: PropTypes.string,
  preferredDetailsFont: PropTypes.string.isRequired,
  extraRehypePlugins: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  className: PropTypes.string,
};

MDEditor.defaultProps = {
  isGithubConnected: false,
  githubRepo: '',
  extraRehypePlugins: undefined,
  className: undefined,
};

export default React.memo(MDEditor);
