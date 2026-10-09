import { useSyncExternalStore } from 'react';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';

// Single source of truth for the sidebar project/board drop (null when nothing is dragged)
// - type: DroppableTypes.PROJECT or DroppableTypes.BOARD
// - id: the dragged project/board id
// - parentId: project id for boards (boards can be reordered only inside their project), undefined for projects
// - index: destination index of the item (passed to the move action)
// - placeholderIndex: index where the placeholder is rendered
// - height: the height of the dragged item, so the placeholder can have the same height
// The slot is derived using top/bottom edge approach

let slot = null;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setSidebarDropSlot = (next) => {
  if (slot === next || (slot && next && slot.type === next.type && slot.id === next.id && slot.index === next.index && slot.placeholderIndex === next.placeholderIndex && slot.height === next.height)) {
    return;
  }

  slot = next;
  listeners.forEach((listener) => listener());
};

export const resolveSidebarDropSlot = (source, location) => {
  const { type, id, parentId, index, height } = source.data;
  const target = location.current.dropTargets.find((item) => item.data.type === type);

  if (!target) {
    return { type, id, parentId, index, placeholderIndex: index, height };
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

  return { type, id, parentId, index: slotIndex, placeholderIndex, height };
};

export const useSidebarDropSlot = (selector) => useSyncExternalStore(subscribe, () => selector(slot));
