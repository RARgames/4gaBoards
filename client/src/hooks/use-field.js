import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const handleFocus = useCallback((e) => {
    e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
  }, []);

  return [value, handleChange, setValue, handleFocus];
};
