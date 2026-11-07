import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

import * as s from './MentionOverlay.module.scss';

// Everything that influences where text wraps/lands must match the textarea exactly
const COPIED_STYLES = [
  'boxSizing',
  'direction',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textIndent',
  'textTransform',
  'wordSpacing',
  'tabSize',
  'wordBreak',
  'overflowWrap',
  'fontFeatureSettings',
  'fontVariantLigatures',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderRightWidth',
];

const COLORS = {
  users: 'var(--backgroundMentionUser)',
  dates: 'var(--backgroundMentionDate)',
};

// Recursively get text color of textarea
function getTextColor(textarea) {
  for (let el = textarea; el; el = el.parentElement) {
    const { color } = window.getComputedStyle(el);
    if (color && color !== 'transparent' && !/,\s*0\)$/.test(color)) return color;
  }
  return '#fff';
}

const getBackgroundColor = ({ type, item }) => (type === 'labels' ? (item && item.color) || 'var(--fallbackColor)' : COLORS[type] || 'var(--fallbackColor)');

function MentionOverlay({ textareaRef, value, mentions, container }) {
  const overlayRef = useRef(null);

  const sync = useCallback(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay || !overlay.offsetParent) {
      return;
    }

    const style = window.getComputedStyle(textarea);
    COPIED_STYLES.forEach((prop) => {
      overlay.style[prop] = style[prop];
    });

    // Visible scrollbar narrows the textarea - reserve the same space
    const scrollbar = Math.max(0, textarea.offsetWidth - textarea.clientWidth - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth));

    overlay.style.setProperty('--mention-text', getTextColor(textarea));
    overlay.style.paddingRight = `${parseFloat(style.paddingRight) + scrollbar}px`;

    const box = textarea.getBoundingClientRect();
    const parent = overlay.offsetParent.getBoundingClientRect();
    overlay.style.top = `${box.top - parent.top - overlay.offsetParent.clientTop}px`;
    overlay.style.left = `${box.left - parent.left - overlay.offsetParent.clientLeft}px`;
    overlay.style.width = `${textarea.offsetWidth}px`;
    overlay.style.height = `${textarea.offsetHeight}px`;
    overlay.scrollTop = textarea.scrollTop;
  }, [textareaRef]);

  useLayoutEffect(sync); // Text changes can change the textarea's height

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return undefined;
    }

    textarea.addEventListener('scroll', sync);
    const observer = typeof ResizeObserver === 'undefined' ? null : new window.ResizeObserver(sync);
    if (observer) observer.observe(textarea);
    window.addEventListener('resize', sync);

    return () => {
      textarea.removeEventListener('scroll', sync);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [textareaRef, sync]);

  const content = useMemo(() => {
    const parts = [];
    let pos = 0;

    [...mentions]
      .sort((a, b) => a.startIndex - b.startIndex)
      .forEach((m) => {
        const text = m.trigger + m.displayText;
        if (m.startIndex < pos || !value.startsWith(text, m.startIndex)) {
          return;
        }
        parts.push(value.slice(pos, m.startIndex));
        parts.push(
          <span key={`${m.startIndex}-${m.id}`} className={s.mention} style={{ '--mention-color': getBackgroundColor(m) }}>
            {text}
          </span>,
        );
        pos = m.startIndex + text.length;
      });

    parts.push(value.slice(pos));

    if (value.endsWith('\n')) parts.push(' ');
    return parts;
  }, [value, mentions]);

  const overlay = (
    <div ref={overlayRef} className={s.overlay} aria-hidden="true">
      {content}
    </div>
  );

  return container ? createPortal(overlay, container) : overlay;
}

MentionOverlay.propTypes = {
  textareaRef: PropTypes.shape({ current: PropTypes.any }).isRequired, // eslint-disable-line react/forbid-prop-types
  value: PropTypes.string.isRequired,
  mentions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  container: PropTypes.instanceOf(window.Element),
};

MentionOverlay.defaultProps = {
  container: null,
};

export default React.memo(MentionOverlay);
