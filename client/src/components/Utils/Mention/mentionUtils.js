export const tokenOf = (m) => `${m.trigger}${m.displayText}`;
export const tokenLength = (m) => m.trigger.length + m.displayText.length;

// Mention must match exactly and be followed by whitespace or the end. */
export const isMentionAt = (text, m) => {
  if (!text.startsWith(tokenOf(m), m.startIndex)) {
    return false;
  }
  const after = text[m.startIndex + tokenLength(m)];
  return after === undefined || /\s/.test(after);
};

const MAX_INSERTED = 64;

// Used to determine whether a broken mention can come back, e.g. "@usxxxer" for "@user"
export function hasBrokenToken(text, m) {
  const token = tokenOf(m);
  let from = text.indexOf(m.trigger);

  while (from !== -1) {
    if (from === 0 || /\s/.test(text[from - 1])) {
      const windowText = text.slice(from, from + token.length + MAX_INSERTED);
      let matched = 0;
      for (let i = 0; i < windowText.length && matched < token.length; i += 1) {
        if (windowText[i] === token[matched]) {
          matched += 1;
        }
      }
      if (matched === token.length) {
        return true;
      }
    }
    from = text.indexOf(m.trigger, from + 1);
  }

  return false;
}

// Dates: always local, never used with toISOString()
const pad = (n) => String(n).padStart(2, '0');

export const formatLocalDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

//  'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm' (local time) -> Date
export const parseLocalDate = (value) => {
  const [day, time] = value.split(' ');
  const [y, m, d] = day.split('-').map(Number);
  const [h, min] = time ? time.split(':').map(Number) : [0, 0];
  return new Date(y, m - 1, d, h, min);
};

export const formatDateMention = (date, time) => `${formatLocalDate(date)}${time ? ` ${time}` : ''}`;

/** Find a mention that is about to be deleted by Backspace or Delete
 * Backspace: caret right behind the mention
 * Delete: caret at its start
 * Inside a mention the key deletes a single character as usual; the edit then breaks the mention
 */
export function findMentionForDeletion(mentions, pos, key) {
  return mentions.find((m) => {
    const end = m.startIndex + tokenLength(m);
    return key === 'Backspace' ? pos === end : pos === m.startIndex;
  });
}

/**
 * Submit data
 * rawText  - text with all mention tokens removed (one space after a mention goes with it)
 * fullText - text as typed
 * mentions - { users: [ids], labels: [ids], dates: ['YYYY-MM-DD' | 'YYYY-MM-DD HH:mm'] } in order of appearance
 * dueDate  - Date for the first date mention or undefined
 */
export function buildSubmitData(text, mentions) {
  const sorted = [...mentions].sort((a, b) => a.startIndex - b.startIndex);
  const grouped = { users: [], labels: [], dates: [] };
  let rawText = '';
  let cursor = 0;

  sorted.forEach((m) => {
    // Defensive: ignore anything that no longer matches the text
    if (m.startIndex < cursor || !isMentionAt(text, m)) {
      return;
    }
    rawText += text.slice(cursor, m.startIndex);

    // The separating space is not part of the mention, but it should not leave a double space behind
    const afterToken = m.startIndex + tokenLength(m);
    cursor = text[afterToken] === ' ' ? afterToken + 1 : afterToken;

    if (!grouped[m.type]) {
      grouped[m.type] = [];
    }
    grouped[m.type].push(m.type === 'dates' ? m.displayText : m.id);
  });

  rawText = (rawText + text.slice(cursor)).trim();

  return {
    rawText,
    fullText: text,
    mentions: grouped,
    dueDate: grouped.dates.length > 0 ? parseLocalDate(grouped.dates[0]) : undefined,
  };
}

export const hasMentions = (submitData) => submitData.mentions.users.length > 0 || submitData.mentions.labels.length > 0 || !!submitData.dueDate;

/** Name to submit: text without mentions, falling back to the full text if nothing else is left */
export const getCleanName = (value, submitData) => submitData.rawText || value.trim();

/** Payload extras for create/update calls. Pass { labels: false } where there is no label trigger */
export function toExtras(submitData, { labels = true } = {}) {
  return {
    userIds: submitData.mentions.users,
    ...(labels ? { labelIds: submitData.mentions.labels } : {}),
    ...(submitData.dueDate ? { dueDate: submitData.dueDate } : {}),
  };
}

/** Assign mentioned users/labels/due date to an existing card, skipping what is already assigned. */
export function applyMentionExtras(submitData, { currentUserIds = [], currentLabelIds = [], onUserAdd, onLabelAdd, onDueDateUpdate }) {
  if (!submitData) {
    return;
  }

  if (onUserAdd) {
    [...new Set(submitData.mentions.users)].filter((id) => !currentUserIds.includes(id)).forEach((id) => onUserAdd(id));
  }
  if (onLabelAdd) {
    [...new Set(submitData.mentions.labels)].filter((id) => !currentLabelIds.includes(id)).forEach((id) => onLabelAdd(id));
  }
  if (onDueDateUpdate && submitData.dueDate) {
    onDueDateUpdate(submitData.dueDate);
  }
}

const MIN_QUERY_BOUND = 32;

/**
 * Finds the trigger the caret is currently "inside".
 * - the trigger must start the text or follow whitespace (so emails and URLs don't match)
 * - the query may contain spaces only while it is still a prefix of some suggestion ("Label with sp")
 * - triggers inside already accepted mentions are ignored
 */
export function findActiveTrigger(text, cursor, triggers, mentions = []) {
  const longestName = Math.max(0, ...triggers.flatMap((t) => t.suggestions.map((su) => su.name.length)));
  const bound = Math.max(MIN_QUERY_BOUND, longestName);

  for (let i = cursor - 1; i >= 0 && cursor - i <= bound + 1; i -= 1) {
    const ch = text[i];
    if (ch === '\n') {
      return null;
    }

    const def = triggers.find((t) => t.trigger === ch);
    const startsWord = i === 0 || /\s/.test(text[i - 1]);
    const insideMention = mentions.some((m) => i >= m.startIndex && i < m.startIndex + tokenLength(m));

    if (def && startsWord && !insideMention) {
      const query = text.slice(i + 1, cursor);
      const lower = query.toLowerCase();
      if (!/\s/.test(query) || def.suggestions.some((su) => su.name.toLowerCase().startsWith(lower))) {
        return { trigger: def, startIndex: i, query };
      }
    }
  }

  return null;
}

/** Case-insensitive match from the beginning of the name */
export function filterSuggestions(active) {
  if (!active) {
    return [];
  }
  const q = active.query.toLowerCase();
  return active.trigger.suggestions.filter((su) => su.name.toLowerCase().startsWith(q));
}

/**
 * Text [start, oldEnd) was replaced by text of length (newEnd - start)
 * Mentions before the edit stay, mentions after it shift, mentions touched by it are removed
 */
export function applyEdit(mentions, start, oldEnd, newEnd) {
  const delta = newEnd - oldEnd;
  const kept = [];
  const removed = [];

  mentions.forEach((m) => {
    if (m.startIndex + tokenLength(m) <= start) {
      kept.push(m);
    } else if (m.startIndex >= oldEnd) {
      kept.push(delta === 0 ? m : { ...m, startIndex: m.startIndex + delta });
    } else {
      removed.push(m);
    }
  });

  return { kept, removed };
}

/** Update mentions based on what changed between two texts */
export function reconcileMentions(prevText, nextText, mentions) {
  if (mentions.length === 0) {
    return { kept: mentions, removed: [], invalidated: [] };
  }

  const max = Math.min(prevText.length, nextText.length);
  let prefix = 0;
  while (prefix < max && prevText[prefix] === nextText[prefix]) {
    prefix += 1;
  }
  let suffix = 0;
  while (suffix < max - prefix && prevText[prevText.length - 1 - suffix] === nextText[nextText.length - 1 - suffix]) {
    suffix += 1;
  }

  const { kept, removed } = applyEdit(mentions, prefix, prevText.length - suffix, nextText.length - suffix);
  const valid = kept.filter((m) => isMentionAt(nextText, m));
  const invalidated = kept.filter((m) => !valid.includes(m));

  return { kept: valid, removed: [...removed, ...invalidated], invalidated };
}

// Rebuilding mentions from saved text (reopening an editor with existing mentions)
const DATE_TOKEN = /^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?(?=\s|$)/;

export function parseMentions(text, triggers) {
  const named = [];
  triggers.forEach((def) => {
    if (def.type === 'dates') return;
    def.suggestions.forEach((su) => named.push({ def, su, token: def.trigger + su.name }));
  });
  named.sort((a, b) => b.token.length - a.token.length);

  const dateDef = triggers.find((d) => d.type === 'dates');
  const result = [];
  let pos = 0;

  // Mention ends at whitespace or the end of the text
  const isBoundary = (index) => text[index] === undefined || /\s/.test(text[index]);

  while (pos < text.length) {
    let found = null;

    // Mention starts the text or follows whitespace
    if (pos === 0 || /\s/.test(text[pos - 1])) {
      // eslint-disable-next-line no-loop-func
      const hit = named.find((e) => text.startsWith(e.token, pos) && isBoundary(pos + e.token.length));
      if (hit) {
        found = { id: hit.su.id, type: hit.def.type, trigger: hit.def.trigger, displayText: hit.su.name, item: hit.su, startIndex: pos };
      } else if (dateDef && text[pos] === dateDef.trigger) {
        const m = DATE_TOKEN.exec(text.slice(pos + 1));
        if (m) {
          found = { id: m[0], type: 'dates', trigger: dateDef.trigger, displayText: m[0], item: { id: m[0], name: m[0] }, startIndex: pos };
        }
      }
    }

    if (found) {
      result.push(found);
      pos += tokenLength(found);
    } else {
      pos += 1;
    }
  }
  return result;
}

/** Mentions in `nextText` that are not in `prevText` (compared by type and id), each reported once. */
export function getAddedMentions(prevText, nextText, triggers) {
  const prev = parseMentions(prevText || '', triggers);
  const added = [];

  parseMentions(nextText || '', triggers).forEach((m) => {
    const known = (list) => list.some((k) => k.type === m.type && k.id === m.id);
    if (!known(prev) && !known(added)) {
      added.push(m);
    }
  });

  return added;
}

const MIRRORED_STYLES = [
  'direction',
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
];

export function getCaretCoordinates(textarea, position) {
  const style = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');
  mirror.style.position = 'absolute';
  mirror.style.top = '0';
  mirror.style.left = '0';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';
  MIRRORED_STYLES.forEach((prop) => {
    mirror.style[prop] = style[prop];
  });

  const { value } = textarea;
  mirror.textContent = value.substring(0, position);

  // Marker holds the word that starts at the caret so wrapping matches the textarea
  const marker = document.createElement('span');
  marker.textContent = value.substring(position).split(/\s/)[0] || '.';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);

  const box = textarea.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  const markerRect = marker.getClientRects()[0] || marker.getBoundingClientRect();

  const coords = {
    left: box.left + (markerRect.left - mirrorRect.left) - textarea.scrollLeft,
    top: box.top + (markerRect.top - mirrorRect.top) - textarea.scrollTop,
    height: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 16,
  };

  document.body.removeChild(mirror);
  return coords;
}

/**
 * Floating UI virtual reference that remeasures the caret every time it is asked, so autoUpdate keeps it correct on scroll/resize without manual bookkeeping
 */
export function createCaretReference(textareaRef, getIndex) {
  return {
    get contextElement() {
      return textareaRef.current || undefined;
    },
    getBoundingClientRect() {
      const textarea = textareaRef.current;
      if (!textarea) {
        return { x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
      }
      const { left, top, height } = getCaretCoordinates(textarea, getIndex());
      return { x: left, y: top, top, left, right: left + 1, bottom: top + height, width: 1, height };
    },
  };
}
