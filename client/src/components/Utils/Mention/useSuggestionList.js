import { useCallback, useEffect, useRef, useState } from 'react';

const useSuggestionList = ({ items, onAccept, onCancel, resetKey }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const rowsRef = useRef([]);

  const lastIndex = items.length - 1;
  const index = Math.max(0, Math.min(selectedIndex, lastIndex)); // Suggestion list can shrink between renders

  useEffect(() => {
    setSelectedIndex(0);
  }, [resetKey]);

  useEffect(() => {
    const row = rowsRef.current[index];
    if (row) {
      row.scrollIntoView({ block: 'nearest' });
    }
  }, [index, items]);

  const itemRef = useCallback(
    (i) => (el) => {
      rowsRef.current[i] = el;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (items.length === 0) {
        return false;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault(); // Prevent moving the cursor in textarea
          setSelectedIndex(Math.max(0, index - 1));
          return true;
        case 'ArrowDown':
          e.preventDefault(); // Prevent moving the cursor in textarea
          setSelectedIndex(Math.min(lastIndex, index + 1));
          return true;
        case 'Enter':
        case 'Tab':
          e.preventDefault(); // Prevent switching focus
          e.stopPropagation(); // Prevent submit by parent popup
          onAccept(items[index]);
          return true;
        case 'Escape':
          e.stopPropagation(); // Prevent submit by parent popup
          if (onCancel) onCancel();
          return true;
        default:
          return false;
      }
    },
    [items, index, lastIndex, onAccept, onCancel],
  );

  return { selectedIndex: index, setSelectedIndex, itemRef, handleKeyDown };
};

export default useSuggestionList;
