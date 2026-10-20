import { useCallback, useEffect, useRef } from 'react';

const SORT_ICON_WIDTH = 13;
const SORT_INDICATOR_GAP = 4;

const measureTextWidth = (text, font, offset = 0) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width + offset;
};

const getSortIndicatorWidth = (sorting, columnId, font) => {
  const sortIndex = sorting.findIndex((sort) => sort.id === columnId);
  if (sortIndex === -1) return 0;

  const indexWidth = sorting.length > 1 ? measureTextWidth(`(${sortIndex + 1})`, font) : 0;
  return SORT_ICON_WIDTH + indexWidth + SORT_INDICATOR_GAP;
};

const asignIfLarger = (a, b) => {
  return Math.max(a, b);
};

export default (tableRef, table, { autoFit = false, autoFitScreen = true, refitKey, sorting = [] } = {}) => {
  const tableLatestRef = useRef(table);
  const sortingLatestRef = useRef(sorting);

  useEffect(() => {
    tableLatestRef.current = table;
    sortingLatestRef.current = sorting;
  }, [sorting, table]);

  const autoSizeColumns = useCallback(
    (scrollToEnd, fitScreen, columnId) => {
      const currentTable = tableLatestRef.current;

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

        const columnsToResize = columnId ? currentTable.getAllLeafColumns().filter((col) => col.id === columnId) : currentTable.getAllLeafColumns().filter((col) => col.getIsVisible());

        if (!columnsToResize.length) {
          return;
        }

        const rowsToProcess = currentTable.getCoreRowModel().rows.slice(0, maxRowsToProcess);

        columnsToResize.forEach((column) => {
          const colId = column.id;
          const minColWidth = column.columnDef.meta?.minSize ?? minColumnWidth;
          const maxColWidth = column.columnDef.meta?.maxSize ?? maxColumnWidth;
          const sortIndicatorWidth = getSortIndicatorWidth(sortingLatestRef.current, colId, headerFont);
          minColSizes[colId] = minColWidth;

          if (column.columnDef.meta?.size) {
            const size = column.columnDef.meta.size + sortIndicatorWidth;
            recommendedColSizes[colId] = size;
            minColSizes[colId] = size;
            return;
          }

          let estimatedSize;
          if (column.columnDef.meta?.headerSize) {
            estimatedSize = column.columnDef.meta.headerSize + sortIndicatorWidth;
          } else {
            const header = column.columnDef.header?.toString() || '';
            estimatedSize = measureTextWidth(header, headerFont, 10) + sortIndicatorWidth;
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
        currentTable.setColumnSizing(finalColSizes);
      } catch {} // eslint-disable-line no-empty

      if (scrollToEnd) {
        tableRef.current.parentNode.scrollBy({ left: tableRef.current.parentNode.scrollWidth, behavior: 'instant' });
      }
    },
    [tableRef],
  );

  const handleResetColumnWidthsClick = useCallback(
    (scrollToEnd = false, fitScreen = autoFitScreen) => {
      if (tableRef.current) {
        autoSizeColumns(scrollToEnd, fitScreen);
      }
    },
    [autoFitScreen, autoSizeColumns, tableRef],
  );

  const handleResizerMouseDown = useCallback((e, header) => {
    e.preventDefault(); // Prevent text selecton when dragging column resizer
    header.getResizeHandler()(e);
  }, []);

  // Fit on mount, whenever refitKey changes, on window resize
  useEffect(() => {
    if (!autoFit) return undefined;
    handleResetColumnWidthsClick(false, autoFitScreen);
    return undefined;
  }, [autoFit, autoFitScreen, handleResetColumnWidthsClick, refitKey]);

  useEffect(() => {
    if (!autoFit) return undefined;

    const onResize = () => handleResetColumnWidthsClick(false, autoFitScreen);
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [autoFit, autoFitScreen, handleResetColumnWidthsClick]);

  return { autoSizeColumns, handleResetColumnWidthsClick, handleResizerMouseDown };
};
