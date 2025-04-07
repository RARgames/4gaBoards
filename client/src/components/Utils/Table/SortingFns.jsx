import { getFullSeconds } from '../../../utils/timer';

const SortingFns = (table) => {
  const isColumnDescending = (colId) => table.getState().sorting.some((sort) => sort.id === colId && sort.desc);

  return {
    localeSortingFn: (rowA, rowB, columnId) => {
      return rowA.original[columnId].localeCompare(rowB.original[columnId]);
    },
    recursiveNameSortingFn: (rowA, rowB, columnId) => {
      const getSortingValue = (values) => values?.map((value) => value.name || '') || [];

      const aList = getSortingValue(rowA.original[columnId]);
      const bList = getSortingValue(rowB.original[columnId]);
      const isDescending = isColumnDescending(columnId);

      const compareRecursively = (aArr, bArr, index = 0) => {
        if (index >= aArr.length && index >= bArr.length) return 0;
        if (index >= aArr.length) return isDescending ? -1 : 1;
        if (index >= bArr.length) return isDescending ? 1 : -1;

        const a = aArr[index];
        const b = bArr[index];

        if (a === '' && b === '') return compareRecursively(aArr, bArr, index + 1);
        if (a === '') return isDescending ? -1 : 1;
        if (b === '') return isDescending ? 1 : -1;

        const comparison = a.localeCompare(b);
        return comparison !== 0 ? comparison : compareRecursively(aArr, bArr, index + 1);
      };

      return compareRecursively(aList, bList);
    },
    timerSortingFn: (rowA, rowB, columnId) => {
      const getSortingValue = (timer) => {
        if (!timer) return undefined;
        return getFullSeconds({ startedAt: timer.startedAt, total: timer.total });
      };

      const a = getSortingValue(rowA.original[columnId]);
      const b = getSortingValue(rowB.original[columnId]);
      return a - b;
    },
    lengthSortingFn: (rowA, rowB, columnId) => {
      const getSortingValue = (value) => value.length;
      const a = getSortingValue(rowA.original[columnId]);
      const b = getSortingValue(rowB.original[columnId]);
      const isDescending = isColumnDescending(columnId);

      if (a === 0 && b === 0) return 0;
      if (a === 0) return isDescending ? -1 : 1;
      if (b === 0) return isDescending ? 1 : -1;

      return a - b;
    },
  };
};

export default SortingFns;
