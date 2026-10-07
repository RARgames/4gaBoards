import { useLayoutEffect } from 'react';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

const DURATION = 150;

let pending = null;
let template = null;
let floating = null;

export const dragKey = (type, id) => `${type}:${id}`;

const findEls = (key) => Array.from(document.querySelectorAll(`[data-drag-key="${key}"]`));
const setVisibility = (key, value) =>
  findEls(key).forEach((el) => {
    // eslint-disable-next-line no-param-reassign
    el.style.visibility = value;
  });

const sanitize = (node) => {
  node.removeAttribute('data-drag-key');
  node.querySelectorAll('[data-drag-key]').forEach((n) => n.removeAttribute('data-drag-key'));
  // eslint-disable-next-line no-param-reassign
  node.style.visibility = 'visible';
  return node;
};

export const getDragData = (el, input, key) => {
  const rect = el.getBoundingClientRect();
  template = { key, node: sanitize(el.cloneNode(true)), width: rect.width, height: rect.height };
  return { dragKey: key, grabX: input.clientX - rect.left, grabY: input.clientY - rect.top };
};

// Clone that replaces the native drag preview
const stopFloat = () => {
  floating?.node.remove();
  floating = null;
};

const moveFloat = (x, y) => {
  if (!floating) return;
  floating.node.style.transform = `translate3d(${x - floating.grabX}px, ${y - floating.grabY}px, 0)`;
};

const startFloat = ({ grabX, grabY }, x, y) => {
  stopFloat();
  const node = template.node.cloneNode(true);
  Object.assign(node.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${template.width}px`,
    height: `${template.height}px`,
    margin: '0',
    boxSizing: 'border-box',
    zIndex: '9999',
    pointerEvents: 'none',
  });
  document.body.appendChild(node);
  floating = { node, grabX, grabY };
  moveFloat(x, y);
};

const flyClone = (node, rect, keyframes, easing, onDone) => {
  Object.assign(node.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: '0',
    boxSizing: 'border-box',
    zIndex: '9999',
    pointerEvents: 'none',
  });
  document.body.appendChild(node);
  const anim = node.animate(keyframes, { duration: DURATION, easing });
  const done = () => {
    node.remove();
    onDone?.();
  };
  anim.onfinish = done;
  anim.oncancel = done;
};

// Collapse preview into target e.g. when dropping a card into a collapsed list
const playIntoTarget = ({ key, x, y, grabX, grabY, targetEl }) => {
  const snap = template;
  template = null;
  if (!snap || snap.key !== key || !targetEl?.isConnected) return;

  const left = x - grabX;
  const top = y - grabY;
  const t = targetEl.getBoundingClientRect();
  const dx = t.left + t.width / 2 - (left + snap.width / 2);
  const dy = t.top - (top + snap.height / 2);

  flyClone(
    snap.node,
    { left, top, width: snap.width, height: snap.height },
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 },
    ],
    'cubic-bezier(0.6, 0, 1, 1)',
  );
};

// Default drop animation
const play = (drop) => {
  const { key, x, y, grabX, grabY } = drop;
  stopFloat();

  const els = findEls(key);
  if (!els.length) {
    playIntoTarget(drop);
    return;
  }

  const el = els[els.length - 1];
  els.slice(0, -1).forEach((other) => {
    // eslint-disable-next-line no-param-reassign
    other.style.visibility = '';
  });
  const show = () => {
    el.style.visibility = '';
  };

  const rect = el.getBoundingClientRect();
  const dx = x - grabX - rect.left;
  const dy = y - grabY - rect.top;

  if (!rect.width || !rect.height || (Math.abs(dx) < 1 && Math.abs(dy) < 1)) {
    show();
    return;
  }

  flyClone(sanitize(el.cloneNode(true)), rect, [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], 'cubic-bezier(0.2, 0, 0, 1)', show);
};

const recordDrop = ({ key, x, y, grabX, grabY, targetEl }) => {
  if (pending) setVisibility(pending.key, '');

  const drop = { key, x, y, grabX, grabY, targetEl };
  pending = drop;
  setVisibility(key, 'hidden');

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (pending !== drop) return;
      pending = null;
      play(drop);
    }),
  );
};

export const dropAnimation = {
  onGenerateDragPreview({ nativeSetDragImage, source }) {
    if (!source.data.dragKey) return;

    setCustomNativeDragPreview({
      nativeSetDragImage,
      render: ({ container }) => {
        const dot = document.createElement('div');
        dot.style.cssText = 'width:1px;height:1px;opacity:0.01';
        container.appendChild(dot);
      },
    });
  },

  onDragStart({ source, location }) {
    if (!source.data.dragKey || template?.key !== source.data.dragKey) return;
    const { clientX, clientY } = location.initial.input;
    startFloat(source.data, clientX, clientY);
  },

  onDrag({ source, location }) {
    if (!source.data.dragKey) return;
    const { clientX, clientY } = location.current.input;
    moveFloat(clientX, clientY);
  },

  onDrop({ source, location }) {
    const { dragKey: key, grabX, grabY } = source.data;
    if (!key) return;
    const { clientX, clientY } = location.current.input;
    recordDrop({ key, x: clientX, y: clientY, grabX, grabY, targetEl: location.current.dropTargets[0]?.element });
  },
};

export const useDropAnimation = (ref, key) => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.dragKey = key;
    if (pending && pending.key === key) el.style.visibility = 'hidden';
  });
};
