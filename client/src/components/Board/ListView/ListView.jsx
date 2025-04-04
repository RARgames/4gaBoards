import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import { getFullSeconds } from '../../../utils/timer';
import CardAddPopup from '../../CardAddPopup';
import ListAddPopup from '../../ListAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Table } from '../../Utils';
import ListViewStyle from './ListViewStyle';
import {
  DefaultCellRenderer,
  NumberCellRenderer,
  ImageCellRenderer,
  MarkdownCellRenderer,
  LabelsCellRenderer,
  MembersCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  TasksCellRenderer,
  DateCellRenderer,
  ActionsHeaderRenderer,
  ActionsCellRenderer,
} from './Renderers';

import * as gs from '../../../global.module.scss';
import * as s from './ListView.module.scss';

const DEFAULT_COLUMN_VISIBILITY = {
  notificationsCount: true,
  coverUrl: false,
  name: true,
  labels: true,
  users: true,
  listName: true,
  hasDescription: true,
  attachmentsCount: true,
  commentCount: true,
  dueDate: true,
  timer: true,
  tasks: true,
  createdAt: false,
  updatedAt: false,
  description: false,
  actions: true,
};

const ListView = React.memo(
  ({ currentCardId, boardId, filteredCards, isGithubConnected, githubRepo, lists, labelIds, memberIds, listViewStyle, listViewColumnVisibility, canEdit, onCardCreate, onListCreate, onUserPrefsUpdate }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const [sorting, setSorting] = useState([]);
    const rowRefs = useRef({});
    const [columnVisibility, setColumnVisibility] = useState(listViewColumnVisibility);

    const handleClick = useCallback(
      (event, id) => {
        // Prevent card click if user is trying to edit card details such as tasks
        let { target } = event;
        while (target) {
          if (target.dataset.preventCardSwitch) {
            return;
          }
          if (target.classList.contains(s.tableBodyCell)) {
            break;
          }
          target = target.parentElement;
        }

        navigate(Paths.CARDS.replace(':id', id));
        if (document.activeElement) {
          document.activeElement.blur();
        }
      },
      [navigate],
    );

    const scrollCardIntoView = useCallback(() => {
      rowRefs.current[currentCardId]?.scrollIntoView({ behavior: 'auto', block: 'center' });
    }, [currentCardId]);

    useEffect(() => {
      scrollCardIntoView();
    }, [scrollCardIntoView]);

    const handleResizerMouseDown = useCallback((e, header) => {
      e.preventDefault(); // Prevent text selecton when dragging column resizer
      header.getResizeHandler()(e);
    }, []);

    const handleSortingChange = (e, canSort, newSorting) => {
      if (e.target?.classList?.contains(s.resizer)) return;
      if (!canSort) return;

      setSorting((prevSorting) => {
        const existingColumn = prevSorting.find((so) => so.id === newSorting.id);
        // eslint-disable-next-line no-use-before-define
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
    };

    const handleResetColumnSortingClick = useCallback(() => {
      setSorting([]);
    }, []);

    const handleResetColumnVisibilityClick = useCallback(() => {
      setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    }, []);

    const table = useReactTable({
      data: filteredCards,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      enableMultiSort: true,
      columnResizeMode: 'onChange',
      state: { sorting, columnVisibility },
      onSortingChange: handleSortingChange,
      sortingFns: {
        localeSortingFn: (rowA, rowB, columnId) => {
          return rowA.original[columnId].localeCompare(rowB.original[columnId]);
        },
        recursiveNameSortingFn: (rowA, rowB, columnId) => {
          const getSortingValue = (values) => values?.map((value) => value.name || '') || [];

          const aList = getSortingValue(rowA.original[columnId]);
          const bList = getSortingValue(rowB.original[columnId]);

          const isDescending = table.getState().sorting.some((sort) => sort.id === columnId && sort.desc);

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

          const isDescending = table.getState().sorting.some((sort) => sort.id === columnId && sort.desc);

          if (a === 0 && b === 0) return 0;
          if (a === 0) return isDescending ? -1 : 1;
          if (b === 0) return isDescending ? 1 : -1;

          return a - b;
        },
      },
      onColumnVisibilityChange: setColumnVisibility,
      listViewStyle: listViewStyle === 'compact' ? ListViewStyle.Compact : ListViewStyle.Default,
    });

    const measureTextWidth = (text, font) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return 0;
      context.font = font;
      return context.measureText(text).width;
    };

    const handleAutoSizeColumnsHandler = useCallback(
      (parentRef, scrollToEnd, columnId) => {
        try {
          if (scrollToEnd) {
            setTimeout(() => {
              parentRef.current.parentNode.scrollBy({ left: parentRef.current.parentNode.scrollWidth, behavior: 'instant' });
            }, 1);
          }
          const newColumnSizes = {};
          const maxRowsToProcess = 1000;
          const minColumnWidth = 50;
          const maxColumnWidth = 300;
          const columnPadding = 10;
          const defaultFont = '14px Arial';

          const firstTh = parentRef.current.querySelector('th');
          const headerFont = firstTh ? window.getComputedStyle(firstTh).font : defaultFont;
          const firstTd = parentRef.current.querySelector('td');
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

            rowsToProcess.forEach((row) => {
              const cellValue = row.getValue(colId);
              const cellText = String(cellValue || '');
              const cellWidth = measureTextWidth(cellText, bodyFont);
              if (cellWidth > maxCellWidth) {
                maxCellWidth = cellWidth;
              }
            });

            const estimatedWidth = Math.min(Math.max(minColumnWidth, maxCellWidth + columnPadding), maxColumnWidth);
            newColumnSizes[colId] = estimatedWidth;
          });

          const totalNewColumnSizes = Object.values(newColumnSizes).reduce((sum, size) => sum + size, 0);
          const style = window.getComputedStyle(parentRef.current.parentNode);
          const maxVisibleWidth = parentRef.current.parentNode.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);

          if (totalNewColumnSizes < maxVisibleWidth) {
            const scaleFactor = maxVisibleWidth / totalNewColumnSizes;
            Object.keys(newColumnSizes).forEach((id) => {
              newColumnSizes[id] *= scaleFactor;
            });
          }

          table.setColumnSizing(newColumnSizes);
        } catch {} // eslint-disable-line no-empty
      },
      [table],
    );

    const handleResetColumnWidthsClick = useCallback(
      (scrollToEnd = false) => {
        if (tableRef.current) {
          handleAutoSizeColumnsHandler(tableRef, scrollToEnd);
        }
      },
      [handleAutoSizeColumnsHandler],
    );

    useEffect(() => {
      handleResetColumnWidthsClick();
    }, [handleResetColumnWidthsClick, boardId]);

    const columns = [
      {
        accessorKey: 'notificationsCount',
        header: <Icon type={IconType.Bell} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.notifications')} />,
        cell: NumberCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        meta: { headerTitle: t('common.notifications'), headerSize: 20 },
        cellProps: { hideOnZero: true, getTitle: (trans, count) => trans('common.detailsNotifications', { count }) },
      },
      {
        accessorKey: 'coverUrl',
        header: <Icon type={IconType.Image} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.coverImage')} />,
        cell: ImageCellRenderer,
        enableSorting: true,
        sortUndefined: 'last',
        sortDescFirst: true,
        meta: { headerTitle: t('common.coverImage'), headerSize: 20 },
      },
      {
        accessorKey: 'name',
        header: t('common.name'),
        cell: DefaultCellRenderer,
        enableSorting: true,
        sortingFn: 'localeSortingFn',
        meta: { headerTitle: t('common.name') },
      },
      {
        accessorKey: 'labels',
        header: t('common.labels'),
        cell: LabelsCellRenderer,
        enableSorting: true,
        sortingFn: 'recursiveNameSortingFn',
        meta: { headerTitle: t('common.labels') },
      },
      {
        accessorKey: 'users',
        header: t('common.members'),
        cell: MembersCellRenderer,
        enableSorting: true,
        sortingFn: 'recursiveNameSortingFn',
        meta: { headerTitle: t('common.members') },
      },
      { accessorKey: 'listName', header: t('common.listName'), cell: ListNameCellRenderer, enableSorting: true, sortingFn: 'localeSortingFn', meta: { headerTitle: t('common.listName') } },
      {
        accessorKey: 'hasDescription',
        header: <Icon type={IconType.BarsStaggered} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.hasDescription')} />,
        cell: HasDescriptionCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        meta: { headerTitle: t('common.hasDescription'), headerSize: 20 },
      },
      {
        accessorKey: 'attachmentsCount',
        header: <Icon type={IconType.Attach} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.attachmentCount')} />,
        cell: NumberCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        meta: { headerTitle: t('common.attachmentCount'), headerSize: 20 },
        cellProps: { hideOnZero: true, getTitle: (trans, count) => trans('common.detailsAttachments', { count }) },
      },
      {
        accessorKey: 'commentCount',
        header: <Icon type={IconType.Comment} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.commentCount')} />,
        cell: NumberCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        meta: { headerTitle: t('common.commentCount'), headerSize: 20 },
        cellProps: { hideOnZero: true, getTitle: (trans, count) => trans('common.detailsComments', { count }) },
      },
      {
        accessorKey: 'dueDate',
        header: t('common.dueDate', { context: 'title' }),
        cell: DueDateCellRenderer,
        enableSorting: true,
        sortUndefined: 'last',
        meta: { headerTitle: t('common.dueDate', { context: 'title' }) },
      },
      {
        accessorKey: 'timer',
        header: t('common.timer'),
        cell: TimerCellRenderer,
        enableSorting: true,
        sortUndefined: 'last',
        sortDescFirst: true,
        sortingFn: 'timerSortingFn',
        meta: { headerTitle: t('common.timer') },
      },
      {
        accessorKey: 'tasks',
        header: t('common.tasks'),
        cell: TasksCellRenderer,
        enableSorting: true,
        sortDescFirst: true,
        sortingFn: 'lengthSortingFn',
        meta: { headerTitle: t('common.tasks') },
      },
      {
        accessorKey: 'createdAt',
        header: t('common.created'),
        cell: DateCellRenderer,
        enableSorting: true,
        meta: { headerTitle: t('common.created') },
      },
      {
        accessorKey: 'updatedAt',
        header: t('common.updated'),
        cell: DateCellRenderer,
        enableSorting: true,
        sortUndefined: 'last',
        meta: { headerTitle: t('common.updated') },
      },
      {
        accessorKey: 'description',
        header: t('common.description'),
        cell: MarkdownCellRenderer,
        enableSorting: false,
        meta: { headerTitle: t('common.description') },
        cellProps: { isGithubConnected, githubRepo },
      },
      {
        accessorKey: 'actions',
        header: ActionsHeaderRenderer,
        cell: ActionsCellRenderer,
        enableSorting: false,
        enableResizing: false,
        meta: { size: 30 },
        headerProps: {
          onResetColumnSorting: handleResetColumnSortingClick,
          onResetColumnWidths: handleResetColumnWidthsClick,
          onResetColumnVisibility: handleResetColumnVisibilityClick,
          onUserPrefsUpdate,
        },
      },
    ];

    table.setOptions((prev) => ({ ...prev, columns }));

    return (
      <div className={classNames(s.wrapper, gs.scrollableX)}>
        <Table ref={tableRef} className={s.table} style={{ width: `${table.getCenterTotalSize()}px` }}>
          <Table.Header className={classNames(s.tableHeader, listViewStyle === 'compact' ? s.tableHeaderCompact : s.tableHeaderDefault)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.HeaderRow key={headerGroup.id} className={s.tableHeaderRow}>
                {headerGroup.headers.map((header) => {
                  const sortedState = header.column.getIsSorted();
                  const sortIndex = sorting.length > 1 ? sorting.findIndex((so) => so.id === header.column.id) + 1 : null;

                  return (
                    <Table.HeaderCell
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      colSpan={header.colSpan}
                      onClick={(e) => handleSortingChange(e, header.column.getCanSort(), { id: header.column.id, desc: sortedState === 'asc' })}
                      className={classNames(s.tableHeaderCell, header.column.getCanSort() && gs.cursorPointer)}
                      title={header.column.columnDef.meta?.headerTitle}
                    >
                      <div className={s.tableHeaderCellInnerWrapper}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortedState && (
                          <div className={s.sortingIndicator}>
                            <Icon type={IconType.SortArrowUp} size={IconSize.Size13} className={classNames(sortedState === 'desc' && s.sortingIconRotated)} />
                            {sortIndex && <sub className={s.sortingIndex}>({sortIndex})</sub>}
                          </div>
                        )}
                        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                        {header.column.getCanResize() && <div className={s.resizer} onMouseDown={(e) => handleResizerMouseDown(e, header)} />}
                      </div>
                    </Table.HeaderCell>
                  );
                })}
              </Table.HeaderRow>
            ))}
          </Table.Header>
          <Table.Body className={classNames(s.tableBody, listViewStyle === 'compact' ? s.tableBodyCompact : s.tableBodyDefault)}>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                // eslint-disable-next-line no-return-assign
                ref={(el) => (rowRefs.current[row.original.id] = el)}
                key={row.id}
                className={classNames(s.tableBodyRow, row.original.id === currentCardId && s.tableBodyRowSelected)}
                onClick={(e) => {
                  if (!row.original.isPersisted) return;
                  handleClick(e, row.original.id);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} style={{ width: `${cell.column.getSize()}px` }} className={classNames(s.tableBodyCell)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {canEdit && (
          <div className={s.floatingButtonsWrapper}>
            <ListAddPopup onCreate={onListCreate} offset={5} position="top">
              <Button style={ButtonStyle.DefaultBorder} title={t('common.addList', { context: 'title' })} className={s.floatingButton}>
                <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.floatingButtonIcon} />
                <span className={s.floatingButtonText}>{t('common.addList', { context: 'title' })}</span>
              </Button>
            </ListAddPopup>
            <CardAddPopup lists={lists} labelIds={labelIds} memberIds={memberIds} onCreate={onCardCreate} offset={5} position="top">
              <Button style={ButtonStyle.DefaultBorder} title={t('common.addCard', { context: 'title' })} className={s.floatingButton}>
                <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.floatingButtonIcon} />
                <span className={s.floatingButtonText}>{t('common.addCard', { context: 'title' })}</span>
              </Button>
            </CardAddPopup>
          </div>
        )}
      </div>
    );
  },
);

ListView.propTypes = {
  currentCardId: PropTypes.string,
  boardId: PropTypes.string.isRequired,
  filteredCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  listViewStyle: PropTypes.string.isRequired,
  listViewColumnVisibility: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

ListView.defaultProps = {
  currentCardId: null,
};

export default ListView;
