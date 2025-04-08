import { useCallback } from 'react';

export default (tableRef, table) => {
  const measureTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
  };

  const autoSizeColumns = useCallback(
    (scrollToEnd, fitScreen, columnId) => {
      try {
        if (scrollToEnd) {
          setTimeout(() => {
            tableRef.current.parentNode.scrollBy({ left: tableRef.current.parentNode.scrollWidth, behavior: 'instant' });
          }, 1);
        }
        const newColumnSizes = {};
        const maxRowsToProcess = 1000;
        const minColumnWidth = 50;
        const maxColumnWidth = 300;
        const columnPadding = 10;
        const defaultFont = '14px Arial';

        const firstTh = tableRef.current.querySelector('th');
        const headerFont = firstTh ? window.getComputedStyle(firstTh).font : defaultFont;
        const firstTd = tableRef.current.querySelector('td');
        const bodyFont = firstTd ? window.getComputedStyle(firstTd).font : defaultFont;

        const columnsToResize = columnId ? table.getAllLeafColumns().filter((col) => col.id === columnId) : table.getAllLeafColumns().filter((col) => col.getIsVisible());

        if (!columnsToResize.length) {
          return;
        }

        const rowsToProcess = table.getCoreRowModel().rows.slice(0, maxRowsToProcess);

        columnsToResize.forEach((column) => {
          const colId = column.id;

          if (column.columnDef.meta?.size) {
            newColumnSizes[colId] = column.columnDef.meta.size;
            return;
          }

          let maxCellWidth;
          if (column.columnDef.meta?.headerSize) {
            maxCellWidth = column.columnDef.meta.headerSize;
          } else {
            const header = column.columnDef.header?.toString() || '';
            maxCellWidth = measureTextWidth(header, headerFont);
          }

          if (column.columnDef.meta?.suggestedCellSize) {
            maxCellWidth = column.columnDef.meta.suggestedCellSize;
          } else if (column.columnDef.meta?.getCellWidthWithArrayLength) {
            rowsToProcess.forEach((row) => {
              const cellValue = row.getValue(colId);
              const cellWidth = column.columnDef.meta.getCellWidthWithArrayLength(cellValue.length);
              if (cellWidth > maxCellWidth) {
                maxCellWidth = cellWidth;
              }
            });
          } else {
            rowsToProcess.forEach((row) => {
              const cellValue = row.getValue(colId);
              const cellText = String(cellValue || '');
              const cellWidth = measureTextWidth(cellText, bodyFont);
              if (cellWidth > maxCellWidth) {
                maxCellWidth = cellWidth;
              }
            });
          }

          const estimatedWidth = Math.min(Math.max(minColumnWidth, maxCellWidth + columnPadding), maxColumnWidth);
          newColumnSizes[colId] = estimatedWidth;
        });

        const totalNewColumnSizes = Object.values(newColumnSizes).reduce((sum, size) => sum + size, 0);
        const style = window.getComputedStyle(tableRef.current.parentNode);
        const maxVisibleWidth = tableRef.current.parentNode.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

        if (fitScreen || (!fitScreen && totalNewColumnSizes < maxVisibleWidth)) {
          const scaleFactor = (maxVisibleWidth - 1) / totalNewColumnSizes;
          Object.keys(newColumnSizes).forEach((id) => {
            newColumnSizes[id] *= scaleFactor;
          });
        }

        table.setColumnSizing(newColumnSizes);
      } catch {} // eslint-disable-line no-empty
    },
    [tableRef, table],
  );

  const handleResetColumnWidthsClick = useCallback(
    (scrollToEnd = false, fitScreen = false) => {
      if (tableRef.current) {
        autoSizeColumns(scrollToEnd, fitScreen);
      }
    },
    [autoSizeColumns, tableRef],
  );

  const handleResizerMouseDown = useCallback((e, header) => {
    e.preventDefault(); // Prevent text selecton when dragging column resizer
    header.getResizeHandler()(e);
  }, []);

  return { autoSizeColumns, handleResetColumnWidthsClick, handleResizerMouseDown };
};
