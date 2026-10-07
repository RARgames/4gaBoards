import { useSyncExternalStore } from 'react';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';

import DroppableTypes from '../../constants/DroppableTypes';

// Single source of truth for the task drop (null when no task is dragged)
// - taskId: the dragged task id
// - cardId: the dragged task's card id
// - variant: Tasks variant
// - index: destination index of the task (passed to the move action)
// - placeholderIndex: index where the placeholder is rendered
// - height: the height of the dragged task, so the placeholder can have the same height
// The slot is derived using top/bottom edge approach

let slot = null;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setTaskDropSlot = (next) => {
  if (
    slot === next ||
    (slot && next && slot.taskId === next.taskId && slot.variant === next.variant && slot.index === next.index && slot.placeholderIndex === next.placeholderIndex && slot.height === next.height)
  ) {
    return;
  }

  slot = next;
  listeners.forEach((listener) => listener());
};

export const clearTaskDropSlot = (cardId, variant) => {
  if (slot && slot.cardId === cardId && slot.variant === variant) {
    setTaskDropSlot(null);
  }
};

export const resolveTaskDropSlot = (source, location) => {
  const { taskId, cardId, variant, index, height } = source.data;
  const target = location.current.dropTargets.find((item) => item.data.type === DroppableTypes.TASK);

  if (!target || target.data.taskId === taskId) {
    return { taskId, cardId, variant, index, placeholderIndex: index, height };
  }

  const { index: targetIndex, endIndex } = target.data;
  const slotIndex =
    endIndex !== undefined
      ? endIndex - 1
      : getReorderDestinationIndex({
          startIndex: index,
          indexOfTarget: targetIndex,
          closestEdgeOfTarget: extractClosestEdge(target.data),
          axis: 'vertical',
        });

  const placeholderIndex = slotIndex > index ? slotIndex + 1 : slotIndex;

  return { taskId, cardId, variant, index: slotIndex, placeholderIndex, height };
};

export const useTaskDropSlot = (selector) => useSyncExternalStore(subscribe, () => selector(slot));
