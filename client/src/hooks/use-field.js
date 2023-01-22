import { useCallback, useState } from 'react';

export default (initialValue) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((_, { value: nextValue }) => {
    setValue(nextValue);
  }, []);

  const handleFocus = useCallback((_) => {
    _.currentTarget.setSelectionRange(_.currentTarget.value.length, _.currentTarget.value.length);
  }, []);

  return [value, handleChange, setValue, handleFocus];
};
