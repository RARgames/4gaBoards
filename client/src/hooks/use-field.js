import { useCallback, useState } from 'react';

export const focusToEnd = (e) => {
  e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
};

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return [value, handleChange, setValue, focusToEnd];
};
