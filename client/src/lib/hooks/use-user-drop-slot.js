import { useEffect, useSyncExternalStore } from 'react';
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import DroppableTypes from '../../constants/DroppableTypes';

// Single source of truth for the user drop (null when no user is dragged)
// - cardId: the card id of the hovered card
// - taskId the task id of the hovered task (undefined for a card)
// - target: the target type: DroppableTypes.CARD | DroppableTypes.CARDMODAL | DroppableTypes.TASK-<variant> | DroppableTypes.LISTVIEWCARD
// - user: { id, name, avatarUrl } of the dragged user, used for the placeholder
// slot: what is hovered right now (null when nothing)
// dropped: the last drop, kept for 300ms so animation can finish

let slot = null;
let dropped = null;
let droppedTimeout = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setUserDropSlot = (next) => {
  if (slot === next || (slot && next && slot.cardId === next.cardId && slot.taskId === next.taskId && slot.target === next.target && slot.user.id === next.user.id)) {
    return;
  }

  slot = next;
  emit();
};

const markDropped = (next) => {
  clearTimeout(droppedTimeout);
  dropped = next;
  emit();
  droppedTimeout = setTimeout(() => {
    dropped = null;
    emit();
  }, 300);
};

const findUserTarget = (location) => location.current.dropTargets.find((item) => item.data.target);

const resolveSlot = ({ source, location }) => {
  const innermost = findUserTarget(location);

  if (!innermost || innermost.data.isAssigned) {
    return null;
  }

  const { cardId, taskId, target } = innermost.data;
  const { userId, name, avatarUrl } = source.data;

  return { cardId, taskId, target, user: { id: userId, name, avatarUrl } };
};

monitorForElements({
  canMonitor: ({ source }) => source.data.type === DroppableTypes.USER,
  onDragStart: (args) => setUserDropSlot(resolveSlot(args)),
  onDropTargetChange: (args) => setUserDropSlot(resolveSlot(args)),
  onDrop: () => setUserDropSlot(null),
});

export const useUserDropSlot = (selector) => useSyncExternalStore(subscribe, () => selector(slot));
export const useUserDropped = (selector) => useSyncExternalStore(subscribe, () => selector(dropped));

export const useUserDropTarget = (ref, { cardId, taskId, target, enabled, assignedUserIds, onUserDrop }) => {
  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element) {
      return undefined;
    }

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === DroppableTypes.USER,
      getData: ({ source }) => ({ cardId, taskId, target, isAssigned: assignedUserIds.includes(source.data.userId) }),
      onDrop: ({ source, location, self }) => {
        if (findUserTarget(location)?.element !== self.element || assignedUserIds.includes(source.data.userId)) {
          return;
        }

        markDropped({ cardId, taskId, target, userId: source.data.userId });
        onUserDrop(source.data.userId);
      },
    });
  }, [ref, cardId, taskId, target, enabled, assignedUserIds, onUserDrop]);
};
