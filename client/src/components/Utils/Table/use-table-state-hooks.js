import { useState, useCallback } from 'react';

export default (defaultColumnVisibility) => {
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);
  const [sorting, setSorting] = useState([]);

  const handleResetColumnSortingClick = useCallback(() => {
    setSorting([]);
  }, [setSorting]);

  return { columnVisibility, setColumnVisibility, sorting, setSorting, handleResetColumnSortingClick };
};
