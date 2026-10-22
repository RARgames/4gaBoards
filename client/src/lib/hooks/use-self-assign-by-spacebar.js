import { useEffect } from 'react';

const TEXT_CONTROLS = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"]';

// Returns true if the event was consumed and the caller should assign/unassign
export const consumeSpaceKey = (e, el, extraGuard) => {
  if (e.code !== 'Space' || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return false;
  if (el.querySelector('[data-self-assign-task]:hover')) return false; // Inner task assign wins over card assign
  if (extraGuard?.(e)) return false;
  if (e.target.closest?.(TEXT_CONTROLS)) return false;

  const clickable = e.target.closest?.('a, button');
  if (clickable && el.contains(clickable) && !clickable.hasAttribute('data-self-assign-card')) return false;

  e.preventDefault();
  return true;
};

export default function useSelfAssignBySpacebar(ref, { enabled, isAssigned, onAssign, onUnassign, extraGuard }) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;

    const handleKeyDown = (e) => {
      if (consumeSpaceKey(e, el, extraGuard)) {
        (isAssigned ? onUnassign : onAssign)();
      }
    };
    const enter = () => document.addEventListener('keydown', handleKeyDown);
    const leave = () => document.removeEventListener('keydown', handleKeyDown);

    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    if (el.matches(':hover')) enter();

    return () => {
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
      leave();
    };
  }, [ref, enabled, isAssigned, onAssign, onUnassign, extraGuard]);
}
