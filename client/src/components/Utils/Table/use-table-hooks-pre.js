import { useCallback } from 'react';

export default (tableRef, table) => {
  const measureTextWidth = (text, font, offset = 0) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width + offset;
  };

  const asignIfLarger = (a, b) => {
    return Math.max(a, b);
  };

  const autoSizeColumns = useCallback(
    (scrollToEnd, fitScreen, columnId) => {
      try {
        const minColSizes = {};
        const recommendedColSizes = {};
        let finalColSizes = {};

        const maxRowsToProcess = 1000;
        const minColumnWidth = 20;
        const maxColumnWidth = 300;
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
          const minColWidth = column.columnDef.meta?.minSize ?? minColumnWidth;
          const maxColWidth = column.columnDef.meta?.maxSize ?? maxColumnWidth;
          minColSizes[colId] = minColWidth;

          if (column.columnDef.meta?.size) {
            recommendedColSizes[colId] = column.columnDef.meta.size;
            minColSizes[colId] = column.columnDef.meta.size;
            return;
          }

          let estimatedSize;
          if (column.columnDef.meta?.headerSize) {
            estimatedSize = column.columnDef.meta.headerSize;
          } else {
            const header = column.columnDef.header?.toString() || '';
            estimatedSize = measureTextWidth(header, headerFont, 10);
          }
          minColSizes[colId] = asignIfLarger(estimatedSize, minColWidth);

          if (column.columnDef.meta?.suggestedSize) {
            estimatedSize = asignIfLarger(estimatedSize, column.columnDef.meta.suggestedSize);
          } else if (column.columnDef.meta?.getCellWidthWithArrayLength) {
            rowsToProcess.forEach((row) => {
              const cellValue = row.getValue(colId);
              const cellWidth = column.columnDef.meta.getCellWidthWithArrayLength(cellValue?.length ?? 0);
              estimatedSize = asignIfLarger(estimatedSize, cellWidth);
            });
          } else {
            rowsToProcess.forEach((row) => {
              const cellValue = row.getValue(colId);
              const cellText = String(cellValue || '');
              const cellWidth = measureTextWidth(cellText, bodyFont, 10);
              estimatedSize = asignIfLarger(estimatedSize, cellWidth);
            });
          }

          recommendedColSizes[colId] = Math.min(Math.max(minColWidth, estimatedSize), maxColWidth);
        });
        const minTotalWidth = Object.values(minColSizes).reduce((sum, val) => sum + val, 0);
        const recommendedTotalWidth = Object.values(recommendedColSizes).reduce((sum, val) => sum + val, 0);

        const style = window.getComputedStyle(tableRef.current.parentNode);
        const availableWidth = tableRef.current.parentNode.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

        const maxAvailableWidth = Math.max(availableWidth, minTotalWidth);
        if (fitScreen || (!fitScreen && recommendedTotalWidth < maxAvailableWidth)) {
          const scaleFactor = availableWidth / minTotalWidth;
          if (scaleFactor < 1) {
            finalColSizes = minColSizes;
          } else {
            const extraSpaceAvailable = availableWidth - minTotalWidth;
            const extraSpaceNeeded = recommendedTotalWidth - minTotalWidth;
            const scaleFactorFinal = extraSpaceAvailable / extraSpaceNeeded;
            finalColSizes = Object.fromEntries(
              Object.entries(minColSizes).map(([id, minSize]) => {
                const recommendedSize = recommendedColSizes[id];
                const scaledSize = minSize + (recommendedSize - minSize) * scaleFactorFinal;
                return [id, scaledSize];
              }),
            );
          }
        } else {
          finalColSizes = recommendedColSizes;
        }
        table.setColumnSizing(finalColSizes);
      } catch {} // eslint-disable-line no-empty

      if (scrollToEnd) {
        tableRef.current.parentNode.scrollBy({ left: tableRef.current.parentNode.scrollWidth, behavior: 'instant' });
      }
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
