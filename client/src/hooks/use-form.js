import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleFocus = useCallback((event) => {
    event.currentTarget.setSelectionRange(event.currentTarget.value.length, event.currentTarget.value.length);
  }, []);

  return [data, handleFieldChange, setData, handleFocus];
};
