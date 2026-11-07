import { defaultBuildUrl } from 'remark-github';
import { SKIP, visit } from 'unist-util-visit';

import { getColor, getInitials } from '../../User/userAvatar';

// Loaded here so mentions are styled wherever the plugin is used
import './MentionPreview.module.scss';

const DATE_TOKEN = /^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?(?=\s|$)/; // YYYY-MM-DD with an optional " HH:mm", ending at whitespace or the end of the text

const text = (value) => ({ type: 'text', value });
const element = (tagName, className, children = [], extra = {}) => ({ type: 'element', tagName, properties: { className: [className], ...extra }, children });

function buildMentionNode({ triggerDef, suggestion, token }) {
  const name = token.slice(triggerDef.trigger.length);

  if (triggerDef.type === 'users') {
    const colorClass = `mention-avatar-${getColor(name)}`;
    const avatar = suggestion.avatarUrl
      ? element('img', 'mention-avatar', [], { src: suggestion.avatarUrl, alt: '' })
      : {
          type: 'element',
          tagName: 'span',
          properties: { className: ['mention-avatar-initials', colorClass] },
          children: [text(getInitials(name))],
        };
    return element('span', 'mention-user', [avatar, element('span', 'mention-name', [text(name)])]);
  }

  if (triggerDef.type === 'labels') {
    return element('span', 'mention-label', [element('span', 'mention-name', [text(name)])], {
      style: `background-color:${(suggestion && suggestion.color) || 'var(--fallbackColor)'};`,
    });
  }

  return element('span', 'mention-date', [text(name)]);
}

/**
 * Rehype plugin that renders mentions in markdown preview
 * Named tokens are matched longest-first so "@John Doe" wins over "@John"
 */
export default function createMentionPreviewPlugin(mentionTriggers) {
  const namedTokens = [];
  mentionTriggers.forEach((triggerDef) => {
    if (triggerDef.type === 'dates') return;
    triggerDef.suggestions.forEach((suggestion) => {
      namedTokens.push({ token: triggerDef.trigger + suggestion.name, triggerDef, suggestion });
    });
  });
  namedTokens.sort((a, b) => b.token.length - a.token.length);

  const dateTriggers = mentionTriggers.filter((t) => t.type === 'dates');
  const triggerChars = new Set(mentionTriggers.map((t) => t.trigger));

  const matchAt = (str, pos) => {
    // Mention starts the text or follows whitespace, and ends at whitespace or the end
    if (pos > 0 && !/\s/.test(str[pos - 1])) return null;

    const named = namedTokens.find((entry) => {
      if (!str.startsWith(entry.token, pos)) return false;
      const after = str[pos + entry.token.length];
      return after === undefined || /\s/.test(after);
    });
    if (named) return named;

    const dateDef = dateTriggers.find((def) => str[pos] === def.trigger);
    const date = dateDef && DATE_TOKEN.exec(str.slice(pos + 1));
    return date ? { token: dateDef.trigger + date[0], triggerDef: dateDef, suggestion: null } : null;
  };

  const split = (str) => {
    const parts = [];
    let pos = 0;
    let plainStart = 0;

    while (pos < str.length) {
      const found = triggerChars.has(str[pos]) ? matchAt(str, pos) : null;
      if (found) {
        if (pos > plainStart) parts.push(text(str.slice(plainStart, pos)));
        parts.push(buildMentionNode(found));
        pos += found.token.length;
        plainStart = pos;
      } else {
        pos += 1;
      }
    }

    if (parts.length === 0) return null;
    if (plainStart < str.length) parts.push(text(str.slice(plainStart)));
    return parts;
  };

  function mentionPreviewPlugin() {
    return function transformer(tree) {
      visit(tree, 'text', (node, index, parent) => {
        if (!parent || index === null || !node.value || parent.tagName === 'code') return undefined;

        const parts = split(node.value);
        if (!parts) return undefined;

        parent.children.splice(index, 1, ...parts);
        return [SKIP, index + parts.length];
      });
    };
  }

  mentionPreviewPlugin.localUserNames = namedTokens.filter((entry) => entry.triggerDef.type === 'users').map((entry) => entry.suggestion.name);
  return mentionPreviewPlugin;
}

// remark-github `buildUrl` that skips links for local mentions
export function createGithubBuildUrl(rehypePlugins) {
  const localNames = (rehypePlugins || []).flatMap((plugin) => plugin.localUserNames || []);

  return (values) => {
    // remark-github only captures the first word of a name, so compare on a word boundary, this might cause false negatives
    if (values.type === 'mention' && localNames.some((name) => name === values.user || name.startsWith(`${values.user} `))) return false;
    return defaultBuildUrl(values);
  };
}
