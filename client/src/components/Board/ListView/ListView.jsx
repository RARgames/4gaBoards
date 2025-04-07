import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import CardAddPopup from '../../CardAddPopup';
import ListAddPopup from '../../ListAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Table } from '../../Utils';
import { LabelsCellRenderer, MembersCellRenderer, DueDateCellRenderer, TimerCellRenderer, TasksCellRenderer, ActionsCellRenderer } from './Renderers';

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
  createdAt: true,
  updatedAt: true,
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
          if (target.dataset.preventCardSwitchEnd) {
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
      if (e.target?.dataset.preventSorting) return;
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
      onColumnVisibilityChange: setColumnVisibility,
      style: listViewStyle === 'compact' ? Table.Style.Compact : Table.Style.Default,
    });

    const { handleResetColumnWidthsClick } = Table.ColumnAutosizerHook(tableRef, table);
    const sortingFunctions = Table.SortingFns(table);
    table.setOptions((prev) => ({ ...prev, sortingFunctions }));

    useEffect(() => {
      handleResetColumnWidthsClick();
    }, [handleResetColumnWidthsClick, boardId]);

    const columns = useMemo(
      () => [
        {
          accessorKey: 'notificationsCount',
          header: <Icon type={IconType.Bell} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.notifications')} />,
          cell: Table.Renderers.NumberCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          meta: { headerTitle: t('common.notifications'), headerSize: 20 },
          cellProps: { hideOnZero: true, getTitle: (trans, count) => trans('common.detailsNotifications', { count }) },
        },
        {
          accessorKey: 'coverUrl',
          header: <Icon type={IconType.Image} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.coverImage')} />,
          cell: Table.Renderers.ImageCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortDescFirst: true,
          meta: { headerTitle: t('common.coverImage'), headerSize: 20 },
        },
        {
          accessorKey: 'name',
          header: t('common.name'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.name') },
        },
        {
          accessorKey: 'labels',
          header: t('common.labels'),
          cell: LabelsCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.labels') },
        },
        {
          accessorKey: 'users',
          header: t('common.members'),
          cell: MembersCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.members') },
        },
        {
          accessorKey: 'listName',
          header: t('common.listName'),
          cell: Table.Renderers.DefaultCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.listName') },
        },
        {
          accessorKey: 'hasDescription',
          header: <Icon type={IconType.BarsStaggered} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.hasDescription')} />,
          cell: Table.Renderers.BoolCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          meta: { headerTitle: t('common.hasDescription'), headerSize: 20 },
          cellProps: { getTitle: (trans) => trans('common.detailsDescription') },
        },
        {
          accessorKey: 'attachmentsCount',
          header: <Icon type={IconType.Attach} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.attachmentCount')} />,
          cell: Table.Renderers.NumberCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          meta: { headerTitle: t('common.attachmentCount'), headerSize: 20 },
          cellProps: { hideOnZero: true, getTitle: (trans, count) => trans('common.detailsAttachments', { count }) },
        },
        {
          accessorKey: 'commentCount',
          header: <Icon type={IconType.Comment} size={IconSize.Size13} className={s.iconTableHeader} title={t('common.commentCount')} />,
          cell: Table.Renderers.NumberCellRenderer,
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
          meta: { headerTitle: t('common.dueDate', { context: 'title' }), suggestedCellSize: 70 },
        },
        {
          accessorKey: 'timer',
          header: t('common.timer'),
          cell: TimerCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          sortDescFirst: true,
          sortingFn: sortingFunctions.timerSortingFn,
          meta: { headerTitle: t('common.timer') },
        },
        {
          accessorKey: 'tasks',
          header: t('common.tasks'),
          cell: TasksCellRenderer,
          enableSorting: true,
          sortDescFirst: true,
          sortingFn: sortingFunctions.lengthSortingFn,
          meta: { headerTitle: t('common.tasks') },
        },
        {
          accessorKey: 'createdAt',
          header: t('common.created'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          meta: { headerTitle: t('common.created'), suggestedCellSize: 100 },
        },
        {
          accessorKey: 'updatedAt',
          header: t('common.updated'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          meta: { headerTitle: t('common.updated'), suggestedCellSize: 100 },
        },
        {
          accessorKey: 'description',
          header: t('common.description'),
          cell: Table.Renderers.MarkdownCellRenderer,
          enableSorting: false,
          meta: { headerTitle: t('common.description') },
          cellProps: { isGithubConnected, githubRepo },
        },
        {
          accessorKey: 'actions',
          header: Table.Renderers.ActionsHeaderRenderer,
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
      ],
      [t, sortingFunctions, isGithubConnected, githubRepo, handleResetColumnSortingClick, handleResetColumnWidthsClick, handleResetColumnVisibilityClick, onUserPrefsUpdate],
    );

    table.setOptions((prev) => ({ ...prev, columns }));

    return (
      <Table.Wrapper className={classNames(s.wrapper, gs.scrollableX)}>
        <Table ref={tableRef} style={{ width: `${table.getCenterTotalSize()}px` }}>
          <Table.Header style={listViewStyle === 'compact' ? Table.Style.Compact : Table.Style.Default}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.HeaderRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortedState = header.column.getIsSorted();
                  const sortIndex = sorting.length > 1 ? sorting.findIndex((so) => so.id === header.column.id) + 1 : null;

                  return (
                    <Table.HeaderCell
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      colSpan={header.colSpan}
                      onClick={(e) => handleSortingChange(e, header.column.getCanSort(), { id: header.column.id, desc: sortedState === 'asc' })}
                      className={classNames(header.column.getCanSort() && gs.cursorPointer)}
                      title={header.column.columnDef.meta?.headerTitle}
                      isCentered
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <Table.SortingIndicator sortedState={sortedState} sortIndex={sortIndex} />
                      {header.column.getCanResize() && <Table.Resizer data-prevent-sorting onMouseDown={(e) => handleResizerMouseDown(e, header)} />}
                    </Table.HeaderCell>
                  );
                })}
              </Table.HeaderRow>
            ))}
          </Table.Header>
          <Table.Body className={gs.scrollableY} style={listViewStyle === 'compact' ? Table.Style.Compact : Table.Style.Default}>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                // eslint-disable-next-line no-return-assign
                ref={(el) => (rowRefs.current[row.original.id] = el)}
                key={row.id}
                selected={row.original.id === currentCardId}
                onClick={(e) => {
                  if (!row.original.isPersisted) return;
                  handleClick(e, row.original.id);
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} style={{ width: `${cell.column.getSize()}px` }} data-prevent-card-switch-end>
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
      </Table.Wrapper>
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
