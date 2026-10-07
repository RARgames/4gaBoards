import { useSyncExternalStore } from 'react';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';

import DroppableTypes from '../../constants/DroppableTypes';

// Single source of truth for the card drop (null when no card is dragged)
// - cardId: the dragged card id
// - listId: the dragged card's target list id
// - index: destination index of the card in the target list (passed to the move action)
// - placeholderIndex: index where the placeholder is rendered
// - height: the height of the dragged card, so the placeholder can have the same height
// The slot is derived using top/bottom edge approach

let slot = null;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setCardDropSlot = (next) => {
  if (slot === next || (slot && next && slot.listId === next.listId && slot.index === next.index && slot.placeholderIndex === next.placeholderIndex && slot.height === next.height)) {
    return;
  }

  slot = next;
  listeners.forEach((listener) => listener());
};

export const resolveCardDropSlot = (source, location) => {
  const { cardId, listId, index, height } = source.data;
  const target = location.current.dropTargets.find((item) => item.data.type === DroppableTypes.CARD);

  if (!target) {
    return { cardId, listId, index, placeholderIndex: index, height };
  }

  const { listId: targetListId, index: targetIndex, endIndex } = target.data;
  const isSameList = targetListId === listId;
  let slotIndex;

  if (endIndex !== undefined) {
    slotIndex = isSameList && index < endIndex ? endIndex - 1 : endIndex;
  } else if (isSameList) {
    slotIndex = getReorderDestinationIndex({
      startIndex: index,
      indexOfTarget: targetIndex,
      closestEdgeOfTarget: extractClosestEdge(target.data),
      axis: 'vertical',
    });
  } else {
    slotIndex = targetIndex + (extractClosestEdge(target.data) === 'bottom' ? 1 : 0);
  }

  const placeholderIndex = isSameList && slotIndex > index ? slotIndex + 1 : slotIndex;

  return { cardId, listId: targetListId, index: slotIndex, placeholderIndex, height };
};

export const useCardDropSlot = (selector) => useSyncExternalStore(subscribe, () => selector(slot));
