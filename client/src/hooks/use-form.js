import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleFocus = useCallback((e) => {
    e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
  }, []);

  return [data, handleFieldChange, setData, handleFocus];
};
