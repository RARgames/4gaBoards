import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import Paths from '../../../constants/Paths';
import CardAddPopup from '../../CardAddPopup';
import ListAddPopup from '../../ListAddPopup';
import { Button, ButtonStyle, Icon, IconType, IconSize, Table } from '../../Utils';
import { NameCellRenderer, LabelsCellRenderer, MembersCellRenderer, ListNameCellRenderer, DueDateCellRenderer, TimerCellRenderer, TasksCellRenderer, ActionsCellRenderer } from './Renderers';

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
  closestDueDate: true,
  timer: true,
  tasks: true,
  createdAt: false,
  createdBy: false,
  updatedAt: false,
  updatedBy: false,
  description: false,
  actions: true,
};

const ListView = React.memo(
  ({
    isCardModalOpened,
    currentCardId,
    filteredCards,
    isGithubConnected,
    githubRepo,
    lists,
    labelIds,
    memberIds,
    listViewStyle,
    listViewColumnVisibility,
    listViewFitScreen,
    listViewItemsPerPage,
    currentCardIndex,
    canEdit,
    preferredDetailsFont,
    allBoardMemberships,
    onCardCreate,
    onListCreate,
    onUserPrefsUpdate,
  }) => {
    const [t] = useTranslation();
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const tableBodyRef = useRef(null);
    const rowRefs = useRef({});
    const [nameCellFns, setNameCellFns] = useState({});
    const prevFilteredCardIdsRef = useRef([]);
    const initialPageIndexRef = useRef(null);
    if (initialPageIndexRef.current === null) {
      const pageSize = listViewItemsPerPage === 'all' ? Number.MAX_SAFE_INTEGER : Number(listViewItemsPerPage);
      const pageIndex = Math.floor(currentCardIndex / pageSize);
      initialPageIndexRef.current = { pageIndex: pageIndex === -1 ? 0 : pageIndex, pageSize };
    }

    const { columnVisibility, setColumnVisibility, pagination, setPagination, sorting, setSorting, handleResetColumnSortingClick } = Table.HooksState(
      listViewColumnVisibility,
      initialPageIndexRef.current.pageIndex,
      initialPageIndexRef.current.pageSize,
    );

    const handleClick = useCallback(
      (e, id) => {
        // Prevent card click if user is trying to edit card details such as tasks
        let { target } = e;
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

    const handleResetColumnVisibilityClick = useCallback(() => {
      setColumnVisibility(DEFAULT_COLUMN_VISIBILITY);
    }, [setColumnVisibility]);

    const handleColumnVisibilityChange = useCallback(
      (updater) => {
        setColumnVisibility((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          const changedColumns = Object.keys(next).filter((key) => next[key] !== prev[key]);
          const nowHidden = changedColumns.filter((col) => next[col] === false);
          if (nowHidden.length > 0) {
            setSorting((prevSorting) => prevSorting.filter((sort) => !nowHidden.includes(sort.id)));
          }
          return next;
        });
      },
      [setColumnVisibility, setSorting],
    );

    const handlePaginationChange = useCallback(
      (updater) => {
        setPagination((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          if (next.pageSize !== prev.pageSize) {
            const nextPageIndex = Math.floor(currentCardIndex / next.pageSize);
            next.pageIndex = nextPageIndex === -1 ? 0 : nextPageIndex;
          }
          if (next.pageIndex !== prev.pageIndex) {
            tableBodyRef.current?.scrollTo({ top: 0 });
          }
          return next;
        });
      },
      [currentCardIndex, setPagination],
    );

    const table = useReactTable({
      autoResetPageIndex: false,
      data: filteredCards,
      columns: [],
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableMultiSort: true,
      columnResizeMode: 'onChange',
      state: { sorting, columnVisibility, pagination },
      onColumnVisibilityChange: handleColumnVisibilityChange,
      onPaginationChange: handlePaginationChange,
      style: listViewStyle === 'compact' ? Table.Style.Compact : Table.Style.Default,
    });

    const { handleResetColumnWidthsClick, handleResizerMouseDown } = Table.HooksPre(tableRef, table);
    const sortingFunctions = Table.HooksSorting(table);

    const resetColumnsWidths = useCallback(() => {
      handleResetColumnWidthsClick(false, listViewFitScreen);
    }, [handleResetColumnWidthsClick, listViewFitScreen]);

    useEffect(() => {
      resetColumnsWidths();
    }, [resetColumnsWidths, isCardModalOpened]);

    useEffect(() => {
      let resizeTimeout;

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          resetColumnsWidths();
        }, 100);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }, [resetColumnsWidths]);

    const scrollCardIntoView = useCallback(() => {
      setTimeout(() => {
        rowRefs.current[currentCardId]?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 0);
    }, [currentCardId]);

    useEffect(() => {
      scrollCardIntoView();
    }, [scrollCardIntoView, pagination]);

    const adjustPageIndex = useCallback(() => {
      const currentCardIds = filteredCards.map((card) => card.id);
      const prevCardIds = prevFilteredCardIdsRef.current;
      const haveCardsChanged = prevCardIds.length !== currentCardIds.length || prevCardIds.some((id, index) => id !== currentCardIds[index]);

      if (haveCardsChanged) {
        const { pageSize } = table.getState().pagination;
        const pageIndex = Math.floor(currentCardIndex / pageSize);
        setPagination((prev) => ({ ...prev, pageIndex: pageIndex === -1 ? 0 : pageIndex }));
        scrollCardIntoView();
        resetColumnsWidths();
      }

      prevFilteredCardIdsRef.current = currentCardIds;
    }, [currentCardIndex, filteredCards, resetColumnsWidths, scrollCardIntoView, setPagination, table]);

    useEffect(() => {
      adjustPageIndex();
    }, [adjustPageIndex]);

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
          meta: { headerTitle: t('common.coverImage'), minSize: 50, headerSize: 20 },
        },
        {
          accessorKey: 'name',
          header: t('common.name'),
          cell: NameCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.name') },
          cellProps: { onSetNameCellFns: setNameCellFns },
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
          meta: {
            headerTitle: t('common.members'),
            getCellWidthWithArrayLength: (length) => length * 27,
          },
        },
        {
          accessorKey: 'listName',
          header: t('common.list'),
          cell: ListNameCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.localeSortingFn,
          meta: { headerTitle: t('common.list') },
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
          meta: { headerTitle: t('common.dueDate', { context: 'title' }), suggestedSize: 110 },
        },
        {
          accessorKey: 'closestDueDate',
          header: t('common.closestDueDate', { context: 'title' }),
          cell: DueDateCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          meta: { headerTitle: t('common.closestDueDate', { context: 'title' }), suggestedSize: 110 },
          cellProps: { isReadOnly: true, titlePrefix: t('common.cardDueDateSummary') },
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
          header: t('common.createdAt'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          meta: { headerTitle: t('common.createdAt'), suggestedSize: 100 },
        },
        {
          accessorKey: 'createdBy',
          header: t('common.createdBy'),
          cell: Table.Renderers.UserCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.createdBy') },
          cellProps: { getIsMember: (id) => allBoardMemberships.some((m) => m.user?.id === id), isNotMemberTitle: t('common.noLongerBoardMember') },
        },
        {
          accessorKey: 'updatedAt',
          header: t('common.updatedAt'),
          cell: Table.Renderers.DateCellRenderer,
          enableSorting: true,
          sortUndefined: 'last',
          meta: { headerTitle: t('common.updatedAt'), suggestedSize: 100 },
        },
        {
          accessorKey: 'updatedBy',
          header: t('common.updatedBy'),
          cell: Table.Renderers.UserCellRenderer,
          enableSorting: true,
          sortingFn: sortingFunctions.recursiveNameSortingFn,
          meta: { headerTitle: t('common.updatedBy') },
          cellProps: { getIsMember: (id) => allBoardMemberships.some((m) => m.user?.id === id), isNotMemberTitle: t('common.noLongerBoardMember') },
        },
        {
          accessorKey: 'description',
          header: t('common.description'),
          cell: Table.Renderers.MarkdownCellRenderer,
          enableSorting: false,
          meta: { headerTitle: t('common.description') },
          cellProps: { isGithubConnected, githubRepo, preferredDetailsFont },
        },
        {
          accessorKey: 'actions',
          header: Table.Renderers.ActionsHeaderRenderer,
          cell: ActionsCellRenderer,
          enableSorting: false,
          enableResizing: false,
          meta: { size: 30 },
          headerProps: {
            fitScreen: listViewFitScreen,
            userPrefsKeys: {
              columnVisibility: 'listViewColumnVisibility',
              fitScreen: 'listViewFitScreen',
            },
            onResetColumnSorting: handleResetColumnSortingClick,
            onResetColumnWidths: handleResetColumnWidthsClick,
            onResetColumnVisibility: handleResetColumnVisibilityClick,
            onUserPrefsUpdate,
          },
          cellProps: { onOpenNameEdit: (id) => nameCellFns[id]?.open() },
        },
      ],
      [
        t,
        sortingFunctions,
        isGithubConnected,
        githubRepo,
        preferredDetailsFont,
        listViewFitScreen,
        handleResetColumnSortingClick,
        handleResetColumnWidthsClick,
        handleResetColumnVisibilityClick,
        onUserPrefsUpdate,
        allBoardMemberships,
        nameCellFns,
      ],
    );

    const { handleSortingChange } = Table.HooksPost(columns, setSorting);
    table.setOptions((prev) => ({ ...prev, onSortingChange: handleSortingChange, columns }));

    return (
      <Table.Container>
        <Table.Wrapper isPaginated className={clsx(s.wrapper, gs.scrollableX)}>
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
                        className={clsx(header.column.getCanSort() && gs.cursorPointer)}
                        title={header.column.columnDef.meta?.headerTitle}
                        aria-label={header.column.columnDef.meta?.headerAriaLabel}
                        isCentered
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <Table.SortingIndicator sortedState={sortedState} sortIndex={sortIndex} />
                        {header.column.getCanResize() && <Table.Resizer data-prevent-sorting onMouseDown={(e) => handleResizerMouseDown(e, header)} title={t('common.resizeColumn')} />}
                      </Table.HeaderCell>
                    );
                  })}
                </Table.HeaderRow>
              ))}
            </Table.Header>
            <Table.Body ref={tableBodyRef} className={gs.scrollableY} style={listViewStyle === 'compact' ? Table.Style.Compact : Table.Style.Default}>
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
                  className={clsx(canEdit && gs.cursorPointer)}
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
        </Table.Wrapper>
        <Table.Pagination
          table={table}
          itemsPerPage={listViewItemsPerPage}
          rowsCount={filteredCards.length}
          fitScreen={listViewFitScreen}
          userPrefsKeys={{
            itemsPerPage: 'listViewItemsPerPage',
            columnVisibility: 'listViewColumnVisibility',
            fitScreen: 'listViewFitScreen',
          }}
          onResetColumnSorting={handleResetColumnSortingClick}
          onResetColumnWidths={handleResetColumnWidthsClick}
          onResetColumnVisibility={handleResetColumnVisibilityClick}
          onUserPrefsUpdate={onUserPrefsUpdate}
        >
          {canEdit && (
            <div className={s.paginationButtonsWrapper}>
              <ListAddPopup onCreate={onListCreate} offset={5} position="top" wrapperClassName={s.popupWrapper}>
                <Button style={ButtonStyle.DefaultBorder} title={t('common.addList', { context: 'title' })} className={s.paginationButton}>
                  <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.paginationButtonIcon} />
                  <span className={s.paginationButtonText}>{t('common.addList', { context: 'title' })}</span>
                </Button>
              </ListAddPopup>
              <CardAddPopup lists={lists} labelIds={labelIds} memberIds={memberIds} onCreate={onCardCreate} offset={5} position="top" wrapperClassName={s.popupWrapper}>
                <Button style={ButtonStyle.DefaultBorder} title={t('common.addCard', { context: 'title' })} className={s.paginationButton}>
                  <Icon type={IconType.PlusMath} size={IconSize.Size13} className={s.paginationButtonIcon} />
                  <span className={s.paginationButtonText}>{t('common.addCard', { context: 'title' })}</span>
                </Button>
              </CardAddPopup>
            </div>
          )}
        </Table.Pagination>
      </Table.Container>
    );
  },
);

ListView.propTypes = {
  isCardModalOpened: PropTypes.bool.isRequired,
  currentCardId: PropTypes.string,
  filteredCards: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  isGithubConnected: PropTypes.bool.isRequired,
  githubRepo: PropTypes.string.isRequired,
  lists: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  labelIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  memberIds: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  listViewStyle: PropTypes.string.isRequired,
  listViewColumnVisibility: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  listViewFitScreen: PropTypes.bool.isRequired,
  listViewItemsPerPage: PropTypes.string.isRequired,
  currentCardIndex: PropTypes.number,
  canEdit: PropTypes.bool.isRequired,
  preferredDetailsFont: PropTypes.string.isRequired,
  allBoardMemberships: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  onCardCreate: PropTypes.func.isRequired,
  onListCreate: PropTypes.func.isRequired,
  onUserPrefsUpdate: PropTypes.func.isRequired,
};

ListView.defaultProps = {
  currentCardId: null,
  currentCardIndex: undefined,
};

export default ListView;
