import { useSyncExternalStore } from 'react';

import DroppableTypes from '../../constants/DroppableTypes';

// Single source of truth for the list drop (null when no list is dragged)
// - listId: the dragged list id (to hide itself in the same render as the placeholder appears)
// - index: destination index of the list on the board (passed to the move action)
// - placeholderIndex: index where the placeholder is rendered
// - width: the width of the dragged list, so the placeholder can have the same width
// The slot is derived from the pointer X compared to the middle of every other list, so there are no dead zones
// Lists are found by `data-drag-key`, their DOM order is the same as their index

let slot = null;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setListDropSlot = (next) => {
  if (slot === next || (slot && next && slot.listId === next.listId && slot.index === next.index && slot.placeholderIndex === next.placeholderIndex && slot.width === next.width)) {
    return;
  }

  slot = next;
  listeners.forEach((listener) => listener());
};

export const resolveListDropSlot = (source, location) => {
  const { listId, index, width } = source.data;
  const target = location.current.dropTargets.find((item) => item.data.type === DroppableTypes.LIST);

  if (!target) {
    return { listId, index, placeholderIndex: index, width };
  }

  const { clientX } = location.current.input;
  const elements = target.element.querySelectorAll('[data-drag-key^="list:"]');
  let placeholderIndex = 0;

  elements.forEach((element, elementIndex) => {
    if (elementIndex === index) {
      return;
    }

    const rect = element.getBoundingClientRect();
    if (clientX > rect.left + rect.width / 2) {
      placeholderIndex = elementIndex + 1;
    }
  });

  const finalIndex = placeholderIndex > index ? placeholderIndex - 1 : placeholderIndex;

  return { listId, index: finalIndex, placeholderIndex, width };
};

export const useListDropSlot = (selector) => useSyncExternalStore(subscribe, () => selector(slot));
