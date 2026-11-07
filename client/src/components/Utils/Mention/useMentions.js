import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';

import {
  applyEdit,
  buildSubmitData,
  createCaretReference,
  filterSuggestions,
  findActiveTrigger,
  findMentionForDeletion,
  formatDateMention,
  hasBrokenToken,
  parseMentions,
  reconcileMentions,
  tokenLength,
  tokenOf,
} from './mentionUtils';
import useSuggestionList from './useSuggestionList';

const MIDDLEWARE = [offset(4), flip({ fallbackPlacements: ['bottom-start'] }), shift({ padding: 8 })];
const MAX_DROPPED = 20;
const MAX_HISTORY = 30;
const byPosition = (a, b) => a.startIndex - b.startIndex;
const sameMention = (a, b) => a.type === b.type && a.id === b.id;
const EMPTY = [];

const hasLongerMatch = (m, triggers) => {
  const def = triggers.find((t) => t.trigger === m.trigger);
  const typed = `${m.displayText.toLowerCase()} `;
  return !!def && def.suggestions.some((su) => su.name.length > m.displayText.length && su.name.toLowerCase().startsWith(typed));
};

const canAdd = (list, p, allowDuplicates) =>
  !list.some((k) => p.startIndex < k.startIndex + tokenLength(k) && k.startIndex < p.startIndex + tokenLength(p)) &&
  (allowDuplicates || !list.some((k) => k.type === p.type && (p.type === 'dates' || k.id === p.id)));

const changedRange = (prev, next) => {
  const max = Math.min(prev.length, next.length);
  let prefix = 0;
  while (prefix < max && prev[prefix] === next[prefix]) {
    prefix += 1;
  }
  let suffix = 0;
  while (suffix < max - prefix && prev[prev.length - 1 - suffix] === next[next.length - 1 - suffix]) {
    suffix += 1;
  }
  return { start: prefix, end: next.length - suffix };
};

const useMentions = ({ value, triggers, textareaRef, onChange, onMentionChange, onKeyDown, allowDuplicates = false }) => {
  const [mentions, setMentions] = useState(() => parseMentions(value || '', triggers)); // Recoginze mentions in initial value
  const [active, setActive] = useState(null);
  const [pickedDay, setPickedDay] = useState(null);

  const textRef = useRef(value); // Last text known to this hook (emitted by us or set outside)
  const droppedRef = useRef([]); // Mentions broken by an edit, restored if the text returns
  const historyRef = useRef([]); // Recently removed mentions, restored when ctrl+z
  const intentRef = useRef(null); // Next change event means when remove()/insertMention() made it
  const pasteRef = useRef(false); // Next change comes from a paste
  const startIndexRef = useRef(0);
  startIndexRef.current = active ? active.startIndex : 0;

  // The parent replaced the text (submit/reset/open with existing value): rebuild the mentions from it
  // No notify(): these mentions were already saved. `triggers` is left out of the deps on purpose, otherwise a new trigger list would replace the mentions while the user is typing
  useEffect(() => {
    if (value !== textRef.current) {
      textRef.current = value;
      droppedRef.current = [];
      historyRef.current = [];
      setMentions(parseMentions(value || '', triggers));
      setActive(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const notify = useCallback(
    (action, m, item) => {
      if (onMentionChange) {
        onMentionChange({ trigger: m.trigger, type: m.type, action, item: item || { id: m.id, name: m.displayText } });
      }
    },
    [onMentionChange],
  );

  const emit = useCallback(
    (text, nextMentions) => {
      textRef.current = text;
      setMentions(nextMentions);
      onChange(text, buildSubmitData(text, nextMentions));
    },
    [onChange],
  );

  const rememberRemoved = useCallback((list) => {
    if (list.length === 0) {
      return;
    }
    historyRef.current = [...historyRef.current.filter((h) => !list.some((m) => sameMention(h, m))), ...list].slice(-MAX_HISTORY);
  }, []);

  const pendingSelection = useRef(null);

  const applySelection = useCallback(() => {
    const selection = pendingSelection.current;
    const textarea = textareaRef.current;
    pendingSelection.current = null;
    if (!selection || !textarea) {
      return;
    }
    if (selection.focus) {
      textarea.focus();
    }
    textarea.setSelectionRange(selection.from, selection.to);
  }, [textareaRef]);

  useLayoutEffect(applySelection, [value, applySelection]);

  const scheduleSelection = useCallback(
    (from, to = from, focus = true) => {
      pendingSelection.current = { from, to, focus };
      requestAnimationFrame(applySelection);
    },
    [applySelection],
  );

  // Replaces text [from, to) through the browser (execCommand) instead of setting the textarea value, so the edit lands in the browser's undo history and Ctrl+Z / Ctrl+Y keep working. If the browser refuses (no change event), `fallback` applies the edit through state
  const editText = useCallback(
    (from, to, insert, intent, fallback) => {
      const textarea = textareaRef.current;
      intentRef.current = intent;

      if (textarea) {
        try {
          textarea.focus();
          textarea.setSelectionRange(from, to);
          if (insert) {
            document.execCommand('insertText', false, insert);
          } else {
            document.execCommand('delete');
          }
        } catch {
          // Handled below
        }
      }

      if (intentRef.current) {
        intentRef.current = null;
        fallback();
      }
    },
    [textareaRef],
  );

  const onPaste = useCallback(() => {
    pasteRef.current = true;
    setTimeout(() => {
      pasteRef.current = false;
    }, 0);
  }, []);

  const onTextChange = useCallback(
    (newText) => {
      const text = newText || '';
      const prevText = textRef.current;
      const textarea = textareaRef.current;
      const caret = textarea ? textarea.selectionStart : text.length;
      const intent = intentRef.current;
      intentRef.current = null;
      const isPaste = pasteRef.current;
      pasteRef.current = false;

      const { kept, removed } = reconcileMentions(prevText, text, mentions);

      removed.forEach((m) => notify('remove', m));
      rememberRemoved(removed);

      // Edit made by remove() / insertMention(): the mention list follows exactly what they intended
      if (intent) {
        const next = intent.mention ? [...kept, intent.mention].sort(byPosition) : kept;
        if (intent.mention) {
          notify('add', intent.mention, intent.mention.item);
        }
        droppedRef.current = droppedRef.current.filter((d) => hasBrokenToken(text, d));
        setActive(null);
        emit(text, next);
        return;
      }

      // Typed exactly one whitespace character: the token right before it may be a hand-typed mention
      const typedBoundary = !isPaste && text.length === prevText.length + 1 && caret > 0 && /\s/.test(text[caret - 1]);

      // Several characters arrived at once without a paste (undo/redo, cut/drop): removed mentions may be back
      const change = changedRange(prevText, text);
      const isMultiInsert = !isPaste && change.end - change.start >= 2;

      // Remember every mention the edit broke (text appended: "@userxx", text inserted inside: "@usxxer")
      // Forget those whose characters are no longer in the text in order (e.g. after a Backspace inside)
      const dropped = [...droppedRef.current.filter((d) => !removed.some((m) => sameMention(m, d))), ...removed].filter((d) => hasBrokenToken(text, d)).slice(-MAX_DROPPED);

      // A broken mention whose text is intact again (e.g. "@userxx" -> "@user") becomes a mention again
      const restored = dropped.length === 0 ? [] : parseMentions(text, triggers).filter((p) => dropped.some((d) => sameMention(d, p)) && !kept.some((k) => sameMention(k, p)));

      restored.forEach((m) => notify('add', m, m.item));

      let next = restored.length > 0 ? [...kept, ...restored].sort(byPosition) : kept;

      // Pasted text, or a whitespace typed right after a complete token: recognize mentions, as long as they don't overlap or duplicate existing ones
      if (isPaste || typedBoundary) {
        const merged = [...next];
        parseMentions(text, triggers).forEach((p) => {
          // Typing: only the token directly before the typed whitespace, never dates (the picker covers them), and not while a longer suggestion could still match ("@John " vs "John Doe")
          if (typedBoundary && (p.type === 'dates' || p.startIndex + tokenLength(p) !== caret - 1 || hasLongerMatch(p, triggers))) {
            return;
          }
          if (canAdd(merged, p, allowDuplicates)) {
            merged.push(p);
            notify('add', p, p.item);
          }
        });
        next = merged.sort(byPosition);
      } else if (isMultiInsert && historyRef.current.length > 0) {
        // Undo/redo: bring back removed mentions whose text is back in the changed range
        const merged = [...next];
        const brought = [];
        parseMentions(text, triggers).forEach((p) => {
          const touchesChange = p.startIndex < change.end && p.startIndex + tokenLength(p) > change.start;
          if (touchesChange && historyRef.current.some((h) => sameMention(h, p)) && canAdd(merged, p, allowDuplicates)) {
            merged.push(p);
            brought.push(p);
            notify('add', p, p.item);
          }
        });
        if (brought.length > 0) {
          historyRef.current = historyRef.current.filter((h) => !brought.some((p) => sameMention(h, p)));
          next = merged.sort(byPosition);
        }
      }

      droppedRef.current = dropped.filter((d) => !next.some((k) => sameMention(d, k)));

      setActive(findActiveTrigger(text, caret, triggers, next));
      emit(text, next);
    },
    [mentions, triggers, textareaRef, notify, emit, rememberRemoved, allowDuplicates],
  );
  const insertMention = useCallback(
    (mention) => {
      const textarea = textareaRef.current;
      if (!textarea || !active) {
        return;
      }

      const prev = textRef.current;
      const start = active.startIndex;
      const cursor = textarea.selectionStart;
      const end = prev[cursor] === ' ' ? cursor + 1 : cursor;
      const token = `${tokenOf(mention)} `;
      const inserted = { ...mention, startIndex: start };

      const fallback = () => {
        const text = prev.slice(0, start) + token + prev.slice(end);
        const { kept, removed } = applyEdit(mentions, start, end, start + token.length);
        removed.forEach((m) => notify('remove', m));
        rememberRemoved(removed);

        setActive(null);
        emit(text, [...kept, inserted].sort(byPosition));
        notify('add', mention, mention.item);
      };

      editText(start, end, token, { mention: inserted }, fallback);
      scheduleSelection(start + token.length);
    },
    [active, mentions, textareaRef, notify, emit, scheduleSelection, editText, rememberRemoved],
  );

  const selectSuggestion = useCallback(
    (suggestion) => {
      if (!active) {
        return;
      }
      insertMention({ id: suggestion.id, type: active.trigger.type, trigger: active.trigger.trigger, displayText: suggestion.name, item: suggestion });
    },
    [active, insertMention],
  );

  // Time is optional ('HH:mm'): "!2026-10-28" or "!2026-10-28 14:30"
  const selectDate = useCallback(
    (date, time) => {
      if (!active) {
        return;
      }
      const text = formatDateMention(date, time);
      insertMention({ id: text, type: active.trigger.type, trigger: active.trigger.trigger, displayText: text, item: { id: text, name: text } });
    },
    [active, insertMention],
  );

  // keepCaret: the caret/selection stays on the same text. Otherwise it goes where the mention was (Backspace/Delete), which is where the user is typing
  const remove = useCallback(
    (mention, keepCaret) => {
      const textarea = textareaRef.current;
      const prev = textRef.current;
      const start = mention.startIndex;
      const end = start + tokenLength(mention);

      const shiftPlace = (p) => {
        if (p >= end) return p - (end - start);
        return p > start ? start : p;
      };
      const selection = keepCaret && textarea ? { from: shiftPlace(textarea.selectionStart), to: shiftPlace(textarea.selectionEnd), wasFocused: document.activeElement === textarea } : null;

      const fallback = () => {
        const text = prev.slice(0, start) + prev.slice(end);
        const { kept } = applyEdit(mentions, start, end, start);

        setActive(null);
        notify('remove', mention);
        rememberRemoved([mention]);
        emit(text, kept);
      };

      editText(start, end, '', { mention: null }, fallback);

      if (selection) {
        scheduleSelection(selection.from, selection.to, selection.wasFocused);
      } else {
        scheduleSelection(start);
      }
    },
    [mentions, textareaRef, notify, emit, scheduleSelection, editText, rememberRemoved],
  );

  const removeMention = useCallback((mention) => remove(mention, true), [remove]);

  const suggestions = useMemo(() => {
    if (!active) return EMPTY;
    const used = new Set(allowDuplicates ? [] : mentions.filter((m) => m.type === active.trigger.type).map((m) => m.id));
    return filterSuggestions(active).filter((su) => !used.has(su.id));
  }, [active, mentions, allowDuplicates]);
  const isDate = !!active && active.trigger.type === 'dates' && (allowDuplicates || !mentions.some((m) => m.type === 'dates'));
  const isListOpen = !!active && !isDate && suggestions.length > 0;

  useEffect(() => {
    if (!isDate) {
      setPickedDay(null);
    }
  }, [isDate]);

  const backToCalendar = useCallback(() => setPickedDay(null), []);

  const closePopup = useCallback(() => setActive(null), []);

  const {
    selectedIndex,
    itemRef,
    handleKeyDown: handleListKeyDown,
  } = useSuggestionList({
    items: isListOpen ? suggestions : EMPTY,
    onAccept: selectSuggestion,
    onCancel: closePopup,
    resetKey: active ? `${active.startIndex}:${active.query}` : null,
  });

  const handleKeyDown = useCallback(
    (e) => {
      // Step 2 of the date picker: Enter/Tab - select the date without time
      if (isDate && pickedDay && (e.key === 'Enter' || e.key === 'Tab')) {
        e.preventDefault();
        e.stopPropagation();
        selectDate(pickedDay);
        return;
      }

      if (isDate && e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePopup();
        return;
      }

      if (handleListKeyDown(e)) {
        return;
      }

      // Backspace right behind a mention / Delete at its start removes the whole mention.
      // Inside a mention the key is left alone: it deletes one character, the edit breaks the mention and the suggestion popup opens for the remaining text.
      const textarea = textareaRef.current;
      if ((e.key === 'Backspace' || e.key === 'Delete') && textarea && textarea.selectionStart === textarea.selectionEnd) {
        const target = findMentionForDeletion(mentions, textarea.selectionStart, e.key);
        if (target) {
          e.preventDefault();
          remove(target, false);
          return;
        }
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    },

    [isDate, pickedDay, selectDate, closePopup, handleListKeyDown, mentions, textareaRef, remove, onKeyDown],
  );

  const { refs, floatingStyles, update } = useFloating({
    open: !!active,
    whileElementsMounted: autoUpdate,
    placement: 'top-start',
    middleware: MIDDLEWARE,
  });

  const reference = useMemo(() => createCaretReference(textareaRef, () => startIndexRef.current), [textareaRef]);

  useEffect(() => {
    refs.setReference(reference);
  }, [refs, reference]);

  // Caret reference is virtual, so tell Floating UI when the text under it may have moved
  useEffect(() => {
    if (active) {
      update();
    }
  }, [active, update]);

  // Dismiss on outside click
  const isActive = !!active;
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const handleOutside = (e) => {
      if (refs.floating.current && refs.floating.current.contains(e.target)) return;
      if (textareaRef.current && textareaRef.current.contains(e.target)) return;
      setActive(null);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isActive, refs.floating, textareaRef]);

  // Moving the caret away from the typed query (mouse click, Home/End, arrows) closes the popup
  const caretRef = useRef(0);
  caretRef.current = active ? active.startIndex + 1 + active.query.length : 0;
  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const handleSelectionChange = () => {
      const textarea = textareaRef.current;
      if (!textarea || document.activeElement !== textarea) return;
      if (textarea.selectionStart !== caretRef.current || textarea.selectionEnd !== caretRef.current) {
        setActive(null);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isActive, textareaRef]);

  const popup =
    active && (isDate || suggestions.length > 0)
      ? {
          trigger: active.trigger,
          isDate,
          suggestions,
          selectedIndex,
          itemRef,
          setFloating: refs.setFloating,
          floatingStyles,
          onSelect: selectSuggestion,
          onSelectDate: selectDate,
          pickedDay,
          onPickDay: setPickedDay,
          onBackToCalendar: backToCalendar,
        }
      : null;

  return { mentions, onTextChange, onKeyDown: handleKeyDown, onPaste, removeMention, popup };
};

export default useMentions;
