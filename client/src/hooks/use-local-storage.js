import { useCallback } from 'react';

export default (key) => {
  const setLocalValue = useCallback(
    (val) => {
      if (!val) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(val));
      }
    },
    [key],
  );

  const getLocalValue = useCallback(() => {
    const val = JSON.parse(localStorage.getItem(key));
    return val;
  }, [key]);

  return [setLocalValue, getLocalValue];
};
