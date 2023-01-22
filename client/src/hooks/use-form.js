import { useCallback, useState } from 'react';

export default (initialData) => {
  const [data, setData] = useState(initialData);

  const handleFieldChange = useCallback((_, { name: fieldName, value }) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  }, []);

  const handleFocus = useCallback((_) => {
    _.currentTarget.setSelectionRange(_.currentTarget.value.length, _.currentTarget.value.length);
  }, []);

  return [data, handleFieldChange, setData, handleFocus];
};
