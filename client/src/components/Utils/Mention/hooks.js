import { useMemo, useRef, useState, useCallback } from 'react';

import createMentionPreviewPlugin from './mentionPreviewPlugin';
import { buildSubmitData } from './mentionUtils';

const EMPTY_IDS = []; // For memo stability, use empty array instead of new Set() in deps.
const toUserSuggestions = (memberships, excludedIds) => (memberships || []).filter((m) => m.user && !excludedIds.has(m.user.id)).map((m) => ({ id: m.user.id, name: m.user.name, avatarUrl: m.user.avatarUrl }));
const toLabelSuggestions = (labels, excludedIds) => (labels || []).filter((l) => !excludedIds.has(l.id)).map((l) => ({ id: l.id, name: l.name, color: l.color }));

/**
 * @ users
 * # labels (optional)
 * ! dates
 */
export function useMentionTriggers({ memberships, labels = [], withLabels = true, excludeUserIds = EMPTY_IDS, excludeLabelIds = EMPTY_IDS }) {
  return useMemo(
    () => [
      { trigger: '@', type: 'users', suggestions: toUserSuggestions(memberships, new Set(excludeUserIds)) },
      ...(withLabels ? [{ trigger: '#', type: 'labels', suggestions: toLabelSuggestions(labels, new Set(excludeLabelIds)) }] : []),
      { trigger: '!', type: 'dates', suggestions: [] },
    ],
    [memberships, labels, withLabels, excludeUserIds, excludeLabelIds],
  );
}

export function useMentionPreviewPlugin({ memberships, labels }) {
  const triggers = useMentionTriggers({ memberships, labels });
  return useMemo(() => [createMentionPreviewPlugin(triggers)], [triggers]);
}

export function useMentionValue(initial = '') {
  const [state, setState] = useState(() => ({ value: initial, submitData: buildSubmitData(initial, []) }));

  const onChange = useCallback((value, submitData) => {
    setState({ value, submitData: submitData || buildSubmitData(value, []) });
  }, []);

  const reset = useCallback((value = '') => {
    setState({ value, submitData: buildSubmitData(value, []) });
  }, []);

  return [state.value, state.submitData, onChange, reset];
}

//  MentionMDEditor ref callback: captures the textarea and syncs the editor's preview mode with the persisted one. Intentionally not memoized, so it re-runs every render and notices mode changes
export function useEditorRef(mode, onModeChange) {
  const textareaRef = useRef(null);

  const setEditorRef = (node) => {
    if (!node) return;
    if (node.textarea) {
      textareaRef.current = node.textarea;
    }
    if (node.preview !== mode) {
      onModeChange(node.preview);
    }
  };

  return [textareaRef, setEditorRef];
}
