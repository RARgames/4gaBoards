import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const handleFocus = useCallback((event) => {
    event.currentTarget.setSelectionRange(event.currentTarget.value.length, event.currentTarget.value.length);
  }, []);

  return [value, handleChange, setValue, handleFocus];
};
