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
import {
  NameCellRenderer,
  LabelsCellRenderer,
  ListNameCellRenderer,
  HasDescriptionCellRenderer,
  AttachmentsCountCellRenderer,
  CommentCountCellRenderer,
  DueDateCellRenderer,
  TimerCellRenderer,
  ActionsHeaderRenderer,
  ActionsCellRenderer,
} from './Renderers';

import * as gs from '../../../global.module.scss';
import * as s from './ListView.module.scss';

const DEFAULT_COLUMN_VISIBILITY = {
  // name: false,
};

const ListView = React.memo(({ currentCardId, filteredCards, lists, labelIds, memberIds, canEdit, onCardCreate, onListCreate }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState(DEFAULT_COLUMN_VISIBILITY);

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

  // const scrollCardIntoView = useCallback(() => {
  //   cardRef.current?.scrollIntoView({
  //     behavior: 'auto',
  //     block: 'nearest',
  //     inline: 'nearest',
  //   });
  // }, []);

  // // TODO should be possible without 200ms timeout, but it's not due to other issues - somewhere else
  // // eslint-disable-next-line consistent-return
  // useEffect(() => {
  //   if (isOpen) {
  //     const timeout = setTimeout(() => {
  //       scrollCardIntoView();
  //     }, 200);
  //     // TODO this is not working for listview
  //     return () => clearTimeout(timeout);
  //   }
  // }, [isOpen, scrollCardIntoView]);

  //     const handleTasksMouseEnter = useCallback(() => {
  //       setIsDragOverTask(true);
  //     }, []);

  //     const handleTasksMouseOut = useCallback(() => {
  //       setIsDragOverTask(false);
  //     }, []);

  //     const visibleMembersCount = 3;

  // const renderCoverImage = (params) => (params.value ? <img src={params.value} alt="" className={s.cover} /> : null);

  const [sorting, setSorting] = useState([]);
  const data = filteredCards;

  const handleSortingChange = (e, canSort, newSorting) => {
    if (e.target?.classList?.contains(s.resizer)) return;
    if (!canSort) return;

    setSorting((prevSorting) => {
      const existingColumn = prevSorting.find((so) => so.id === newSorting.id);

      if (existingColumn) {
        if (existingColumn.desc === false) {
          return prevSorting.map((so) => (so.id === newSorting.id ? { ...so, desc: true } : so));
        }
        return prevSorting.filter((so) => so.id !== newSorting.id);
      }
      return [...prevSorting, newSorting];
    });
  };

  const handleResetColumnSortingClick = useCallback(() => {
    setSorting([]);
  }, []);

  const handleResetColumnVisibilityClick = useCallback(() => {
    setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
  }, []);

  // TODO maybe use title in meta instead of customRenderer
  const columns = [
    // {
    //   header: '',
    //   cell: ({ row }) => (row.original.coverUrl ? <img src={row.original.coverUrl} alt="" className={s.cover} /> : null),
    // },
    {
      accessorKey: 'name',
      header: t('common.name'),
      cell: NameCellRenderer,
      enableSorting: true,
      sortingFn: 'localeSortingFn',
      meta: { headerTitle: t('common.name') },
    },
    {
      accessorKey: 'labels',
      header: t('common.labels'),
      cell: LabelsCellRenderer,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const getSortingValue = (labels) => {
          if (!labels || labels.length === 0) return '';
          return labels[0].name || '';
        };

        const a = getSortingValue(rowA.original[columnId]);
        const b = getSortingValue(rowB.original[columnId]);

        // eslint-disable-next-line no-use-before-define
        const isDescending = table.getState().sorting.some((sort) => sort.id === columnId && sort.desc);

        if (a === '' && b === '') return 0;
        if (!isDescending) {
          if (a === '') return 1;
          if (b === '') return -1;
        }
        if (a === '') return -1;
        if (b === '') return 1;
        return a.localeCompare(b);
      },
      meta: { headerTitle: t('common.labels') },
    },
    { accessorKey: 'listName', header: t('common.listName'), cell: ListNameCellRenderer, enableSorting: true, sortingFn: 'localeSortingFn', meta: { headerTitle: t('common.listName') } },
    {
      accessorKey: 'hasDescription',
      header: <Icon type={IconType.BarsStaggered} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.hasDescription')} />,
      cell: HasDescriptionCellRenderer,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.original[columnId];
        const b = rowB.original[columnId];
        if (a === b) return 0;
        if (a) return -1;
        return 1;
      },
      meta: { headerTitle: t('common.hasDescription'), headerSize: 20 },
    },
    {
      accessorKey: 'attachmentsCount',
      header: <Icon type={IconType.Attach} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.attachmentCount')} />,
      cell: AttachmentsCountCellRenderer,
      enableSorting: true,
      meta: { headerTitle: t('common.attachmentCount'), headerSize: 20 },
    },
    {
      accessorKey: 'commentCount',
      header: <Icon type={IconType.Comment} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.commentCount')} />,
      cell: CommentCountCellRenderer,
      enableSorting: true,
      meta: { headerTitle: t('common.commentCount'), headerSize: 20 },
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
      sortingFn: (rowA, rowB, columnId) => {
        const getSortingValue = (timer) => {
          if (!timer) return undefined;
          return getFullSeconds({ startedAt: timer.startedAt, total: timer.total });
        };

        const a = getSortingValue(rowA.original[columnId]);
        const b = getSortingValue(rowB.original[columnId]);
        return a - b;
      },
      meta: { headerTitle: t('common.timer') },
    },
    {
      accessorKey: 'actions',
      // eslint-disable-next-line no-use-before-define
      header: (props) => ActionsHeaderRenderer(props, handleResetColumnSortingClick, handleResetColumnWidthsClick, handleResetColumnVisibilityClick),
      cell: ActionsCellRenderer,
      enableSorting: false,
      enableResizing: false,
      meta: { size: 30 },
    },
  ];

  const table = useReactTable({
    data,
    columns,
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
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  const measureTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
  };

  const handleAutoSizeColumnsHandler = useCallback(
    (parentRef, columnId) => {
      try {
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

  const handleResetColumnWidthsClick = useCallback(() => {
    if (tableRef.current) {
      handleAutoSizeColumnsHandler(tableRef);
    }
  }, [handleAutoSizeColumnsHandler]);

  useEffect(() => {
    if (tableRef.current) {
      handleAutoSizeColumnsHandler(tableRef);
    }
  }, [handleAutoSizeColumnsHandler, tableRef]);

  return (
    <div className={classNames(s.wrapper, gs.scrollableX)}>
      <Table ref={tableRef} className={s.table} style={{ width: `${table.getCenterTotalSize()}px` }}>
        <Table.Header className={s.tableHeader}>
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
                      {header.column.getCanResize() && <div className={s.resizer} onMouseDown={header.getResizeHandler()} />}
                    </div>
                  </Table.HeaderCell>
                );
              })}
            </Table.HeaderRow>
          ))}
        </Table.Header>
        <Table.Body className={s.tableBody}>
          {table.getRowModel().rows.map((row) => (
            <Table.Row
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

  // <>
  //       <div>
  //         {notificationsTotal > 0 && notificationsTotal <= 9 && <span className={s.notification}>{notificationsTotal}</span>}
  //         {notificationsTotal > 9 && <span className={classNames(s.notification, s.notificationFull)}>9+</span>}
  //       </div>
  //       {coverUrl && <img src={coverUrl} alt="" className={s.cover} />}
  //       <div className={s.details}>
  //         {tasks.length > 0 && (
  //           <Tasks
  //             variant="card"
  //             isCardActive={isOpen}
  //             cardId={id}
  //             items={tasks}
  //             canEdit={canEdit}
  //             boardMemberships={allBoardMemberships}
  //             onCreate={onTaskCreate}
  //             onUpdate={onTaskUpdate}
  //             onMove={onTaskMove}
  //             onDuplicate={onTaskDuplicate}
  //             onDelete={onTaskDelete}
  //             onUserAdd={onUserToTaskAdd}
  //             onUserRemove={onUserFromTaskRemove}
  //             onMouseEnterTasks={handleTasksMouseEnter}
  //             onMouseLeaveTasks={handleTasksMouseOut}
  //           />
  //         )}
  //         {users.length > 0 && (
  //           <span className={classNames(s.attachments, s.attachmentsRight, s.users)}>
  //             <div className={s.popupWrapper2}>
  //               <MembershipsPopup
  //                 items={allBoardMemberships}
  //                 currentUserIds={users.map((user) => user.id)}
  //                 onUserSelect={(userId) => onUserAdd(userId, id)}
  //                 onUserDeselect={(userId) => onUserRemove(userId, id)}
  //                 offset={0}
  //               >
  //                 {users.slice(0, visibleMembersCount).map((user) => (
  //                   <span key={user.id} className={classNames(s.attachment, s.user)}>
  //                     <User name={user.name} avatarUrl={user.avatarUrl} size="card" />
  //                   </span>
  //                 ))}
  //                 {users.length > visibleMembersCount && (
  //                   <span
  //                     className={classNames(s.attachment, s.user, s.moreUsers)}
  //                     title={users
  //                       .slice(visibleMembersCount)
  //                       .map((user) => user.name)
  //                       .join(',\n')}
  //                   >
  //                     +{users.length - visibleMembersCount}
  //                   </span>
  //                 )}
  //               </MembershipsPopup>
  //             </div>
  //           </span>
  //         )}
  //       </div>
  //     </>
});

ListView.propTypes = {
  currentCardId: PropTypes.string,
  filteredCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool.isRequired,
  onCardCreate: PropTypes.func.isRequired,
  onListCreate: PropTypes.func.isRequired,
};

ListView.defaultProps = {
  currentCardId: null,
};

export default ListView;
