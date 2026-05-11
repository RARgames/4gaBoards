import { useState, useCallback } from 'react';

export default (defaultColumnVisibility, defaultPageIndex, defaultItemsPerPage) => {
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);
  const [pagination, setPagination] = useState({ pageIndex: defaultPageIndex, pageSize: defaultItemsPerPage });
  const [sorting, _setSorting] = useState([]);
  const setSorting = useCallback((updater) => {
    _setSorting(updater);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const handleResetColumnSortingClick = useCallback(() => {
    setSorting([]);
  }, [setSorting]);

  return { columnVisibility, setColumnVisibility, pagination, setPagination, sorting, setSorting, handleResetColumnSortingClick };
};
