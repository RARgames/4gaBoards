import { useCallback } from 'react';

export default (columns, setSorting) => {
  const handleSortingChange = useCallback(
    (e, canSort, newSorting) => {
      if (e.target?.dataset.preventSorting) return;
      if (!canSort) return;

      setSorting((prevSorting) => {
        const existingColumn = prevSorting.find((so) => so.id === newSorting.id);
        const columnDef = columns.find((col) => col.accessorKey === newSorting.id || col.id === newSorting.id);
        const sortDescFirst = columnDef?.sortDescFirst ?? false;

        if (existingColumn) {
          if (existingColumn.desc === sortDescFirst) {
            return prevSorting.map((so) => (so.id === newSorting.id ? { ...so, desc: !sortDescFirst } : so));
          }
          return prevSorting.filter((so) => so.id !== newSorting.id);
        }

        return [...prevSorting, { ...newSorting, desc: sortDescFirst }];
      });
    },
    [columns, setSorting],
  );

  return { handleSortingChange };
};
